import mongoose, { Types } from "mongoose";
import { randomBytes } from "node:crypto";

import { Sale } from "../models/sale.model.js";
import { Variant } from "../models/variant.model.js";
import inventoryService from "./inventory.service.js";
import { ApiError } from "../utils/ApiError.js";

interface CreateSaleItemInput {
    variantId: string;
    quantity: number;
    sellingPrice: number;
}

interface CreateSaleInput {
    items: CreateSaleItemInput[];
    paymentMethod: "CASH" | "UPI" | "CARD";
    amountReceived: number;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    soldBy: string;
}

const validateMoney = (value: number, field: string) => {
    if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < 0 ||
        Math.round(value * 100) !== value * 100
    ) {
        throw new ApiError(
            400,
            `${field} must be a valid amount with up to 2 decimal places`
        );
    }
};

const generateReceiptNumber = () => {
    const date = new Date();
    const datePart = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("");

    const randomPart = randomBytes(3).toString("hex").toUpperCase();

    return `SH-${datePart}-${randomPart}`;
};

export const createSale = async (input: CreateSaleInput) => {
    const {
        items,
        paymentMethod,
        amountReceived,
        customerName,
        customerPhone,
        notes,
        soldBy,
    } = input;

    if (!Types.ObjectId.isValid(soldBy)) {
        throw new ApiError(400, "Invalid staff/user ID");
    }

    if (!Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "At least one sale item is required");
    }

    if (!["CASH", "UPI", "CARD"].includes(paymentMethod)) {
        throw new ApiError(400, "Invalid payment method");
    }

    validateMoney(amountReceived, "Amount received");

    const seenVariants = new Set<string>();

    for (const item of items) {
        if (!Types.ObjectId.isValid(item.variantId)) {
            throw new ApiError(400, "Invalid variant ID");
        }

        if (
            !Number.isInteger(item.quantity) ||
            item.quantity < 1
        ) {
            throw new ApiError(400, "Invalid item quantity");
        }

        validateMoney(item.sellingPrice, "Selling price");

        if (item.sellingPrice <= 0) {
            throw new ApiError(400, "Selling price must be greater than zero");
        }

        if (seenVariants.has(item.variantId)) {
            throw new ApiError(
                400,
                "Duplicate variants are not allowed. Combine their quantities."
            );
        }

        seenVariants.add(item.variantId);
    }

    if (customerName !== undefined && typeof customerName !== "string") {
        throw new ApiError(400, "Invalid customer name");
    }

    if (customerPhone !== undefined && typeof customerPhone !== "string") {
        throw new ApiError(400, "Invalid customer phone");
    }

    const session = await mongoose.startSession();

    try {
        let createdSale: any;

        await session.withTransaction(async () => {
            const saleItems = [];
            let totalPaise = 0;

            for (const item of items) {
                const variant = await Variant.findById(item.variantId)
                    .populate("product", "name")
                    .session(session);

                if (!variant) {
                    throw new ApiError(404, "Product variant not found");
                }

                if (!variant.isAvailable) {
                    throw new ApiError(
                        400,
                        `${variant.volume} ml variant is unavailable`
                    );
                }

                const product = variant.product as any;

                if (!product || !product.name) {
                    throw new ApiError(404, "Associated product not found");
                }

                const listedPrice = Number(variant.price);

                validateMoney(listedPrice, "Listed price");

                const itemSubtotalPaise =
                    Math.round(item.sellingPrice * 100) *
                    item.quantity;

                totalPaise += itemSubtotalPaise;

                saleItems.push({
                    product: product._id,
                    variant: variant._id,
                    productName: product.name,
                    volume: variant.volume,
                    listedPrice,
                    sellingPrice: item.sellingPrice,
                    quantity: item.quantity,
                    subtotal: itemSubtotalPaise / 100,
                });
            }

            const totalAmount = totalPaise / 100;

            if (amountReceived < totalAmount) {
                throw new ApiError(
                    400,
                    "Amount received cannot be less than the sale total"
                );
            }

            if (
                paymentMethod !== "CASH" &&
                amountReceived !== totalAmount
            ) {
                throw new ApiError(
                    400,
                    "UPI and card payments must match the exact sale total"
                );
            }

            const changeReturned =
                paymentMethod === "CASH"
                    ? (Math.round(amountReceived * 100) - totalPaise) / 100
                    : 0;

            const [sale] = await Sale.create(
                [
                    {
                        receiptNumber: generateReceiptNumber(),
                        items: saleItems,
                        subtotal: totalAmount,
                        totalAmount,
                        paymentMethod,
                        amountReceived,
                        changeReturned,
                        customerName: customerName?.trim(),
                        customerPhone: customerPhone?.trim(),
                        notes: notes?.trim(),
                        soldBy: new Types.ObjectId(soldBy),
                    },
                ],
                { session }
            );

            // Deduct inventory and create stock movement records.
            for (const item of items) {
                try {
                    await inventoryService.removeStock(
                        {
                            variantId: item.variantId,
                            quantity: item.quantity,
                            movementType: "POS_SALE",
                            referenceType: "SALE",
                            referenceId: sale._id.toString(),
                            performedBy: soldBy,
                            note: `POS sale ${sale.receiptNumber}`,
                        },
                        session
                    );
                } catch (error) {
                    throw new ApiError(
                        409,
                        error instanceof Error
                            ? error.message
                            : "Unable to update inventory"
                    );
                }
            }

            createdSale = sale;
        });

        return createdSale;
    } finally {
        await session.endSession();
    }
};

export const getAllSales = async ({
    page = 1,
    limit = 20,
    startDate,
    endDate,
    customerPhone,
}: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    customerPhone?: string;
}) => {
    if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
    ) {
        throw new ApiError(400, "Invalid pagination values");
    }

    const filter: Record<string, any> = {};

    if (startDate || endDate) {
        filter.createdAt = {};

        if (startDate) {
            const start = new Date(startDate);

            if (Number.isNaN(start.getTime())) {
                throw new ApiError(400, "Invalid start date");
            }

            filter.createdAt.$gte = start;
        }

        if (endDate) {
            const end = new Date(endDate);

            if (Number.isNaN(end.getTime())) {
                throw new ApiError(400, "Invalid end date");
            }

            filter.createdAt.$lte = end;
        }

        if (
            startDate &&
            endDate &&
            new Date(startDate) > new Date(endDate)
        ) {
            throw new ApiError(400, "Start date cannot be after end date");
        }
    }

    if (customerPhone) {
        filter.customerPhone = customerPhone.trim();
    }

    const skip = (page - 1) * limit;

    const [sales, totalSales] = await Promise.all([
        Sale.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("soldBy", "name email")
            .lean(),

        Sale.countDocuments(filter),
    ]);

    return {
        sales,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalSales / limit),
            totalSales,
            limit,
        },
    };
};

export const getSaleById = async (saleId: string) => {
    if (!Types.ObjectId.isValid(saleId)) {
        throw new ApiError(400, "Invalid sale ID");
    }

    const sale = await Sale.findById(saleId)
        .populate("soldBy", "name email")
        .populate("items.product", "name slug")
        .populate("items.variant", "volume price");

    if (!sale) {
        throw new ApiError(404, "Sale not found");
    }

    return sale;
};
