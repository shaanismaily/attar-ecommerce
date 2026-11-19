
import mongoose, { Types } from "mongoose";
import { Supplier } from "../models/supplier.model.js";
import { RawMaterial } from "../models/rawMaterial.model.js";
import { Purchase } from "../models/purchase.model.js";
import { RawMaterialMovement } from "../models/rawMaterialMovement.model.js";

interface CreatePurchaseItem {
    rawMaterialId: string;
    quantityGrams: number;
    costPerGram: number;
}

interface CreatePurchaseInput {
    supplierId: string;
    items: CreatePurchaseItem[];
    additionalCosts?: number;
    paidAmount?: number;
    purchaseDate?: Date;
    notes?: string;
    purchasedBy?: string;
}

export const createPurchase = async (input: CreatePurchaseInput) => {
    const {
        supplierId,
        items,
        additionalCosts = 0,
        paidAmount = 0,
        purchaseDate,
        notes,
        purchasedBy,
    } = input;

    if (!Types.ObjectId.isValid(supplierId)) {
        throw new Error("Invalid supplier ID");
    }

    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("At least one purchase item is required");
    }

    if (!Number.isFinite(additionalCosts) || additionalCosts < 0) {
        throw new Error("Additional costs cannot be negative");
    }

    if (!Number.isFinite(paidAmount) || paidAmount < 0) {
        throw new Error("Paid amount cannot be negative");
    }

    for (const item of items) {
        if (!Types.ObjectId.isValid(item.rawMaterialId)) {
            throw new Error("Invalid raw material ID");
        }

        if (
            !Number.isFinite(item.quantityGrams) ||
            item.quantityGrams <= 0 ||
            !Number.isFinite(item.costPerGram) ||
            item.costPerGram < 0
        ) {
            throw new Error("Invalid purchase quantity or cost");
        }
    }

    if (
        purchasedBy &&
        !Types.ObjectId.isValid(purchasedBy)
    ) {
        throw new Error("Invalid user ID");
    }

    const session = await mongoose.startSession();

    try {
        let createdPurchaseId: Types.ObjectId | undefined;

        await session.withTransaction(async () => {
            const supplier = await Supplier.findOne({
                _id: supplierId,
                isActive: true,
            }).session(session);

            if (!supplier) {
                throw new Error("Supplier not found or inactive");
            }

            const purchaseItems = [];
            let itemsTotal = 0;

            for (const item of items) {
                const rawMaterial = await RawMaterial.findOne({
                    _id: item.rawMaterialId,
                    isActive: true,
                }).session(session);

                if (!rawMaterial) {
                    throw new Error("Raw material not found or inactive");
                }

                const subtotal =
                    item.quantityGrams * item.costPerGram;

                itemsTotal += subtotal;

                purchaseItems.push({
                    rawMaterial: rawMaterial._id,
                    materialName: rawMaterial.name,
                    quantityGrams: item.quantityGrams,
                    costPerGram: item.costPerGram,
                    subtotal,
                });
            }

            const totalAmount = itemsTotal + additionalCosts;

            if (paidAmount > totalAmount) {
                throw new Error("Paid amount cannot exceed purchase total");
            }

            const paymentStatus =
                paidAmount === 0
                    ? "UNPAID"
                    : paidAmount >= totalAmount
                        ? "PAID"
                        : "PARTIAL";

            const [purchase] = await Purchase.create(
                [
                    {
                        supplier: supplier._id,
                        items: purchaseItems,
                        additionalCosts,
                        totalAmount,
                        paidAmount,
                        paymentStatus,
                        purchaseDate: purchaseDate ?? new Date(),
                        notes,
                        purchasedBy,
                    },
                ],
                { session }
            );

            for (const item of purchaseItems) {
                const rawMaterial = await RawMaterial.findById(
                    item.rawMaterial
                ).session(session);

                if (!rawMaterial) {
                    throw new Error("Raw material not found");
                }

                const stockBefore = rawMaterial.stockGrams;
                const stockAfter =
                    stockBefore + item.quantityGrams;

                rawMaterial.stockGrams = stockAfter;
                await rawMaterial.save({ session });

                await RawMaterialMovement.create(
                    [
                        {
                            rawMaterial: rawMaterial._id,
                            movementType: "PURCHASE",
                            direction: "IN",
                            quantityGrams: item.quantityGrams,
                            stockBefore,
                            stockAfter,
                            referenceType: "PURCHASE",
                            referenceId: purchase._id,
                            performedBy: purchasedBy,
                            note: `Bulk purchase from ${supplier.name}`,
                        },
                    ],
                    { session }
                );
            }

            createdPurchaseId = purchase._id;
        });

        if (!createdPurchaseId) {
            throw new Error("Purchase creation failed");
        }

        return await Purchase.findById(createdPurchaseId)
            .populate("supplier", "name phone")
            .populate("items.rawMaterial", "name sku")
            .lean();
    } finally {
        await session.endSession();
    }
};
