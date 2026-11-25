
import mongoose, { type HydratedDocument, Types } from "mongoose";
import { Supplier } from "../models/supplier.model.js";
import {
    RawMaterial,
    type IRawMaterial,
} from "../models/rawMaterial.model.js";
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

interface PreparedPurchaseItem {
    rawMaterial: HydratedDocument<IRawMaterial>;
    quantityGrams: number;
    costPerGram: number;
    subtotal: number;
}

const roundMoney = (value: number) =>
    Math.round((value + Number.EPSILON) * 100) / 100;

const roundCost = (value: number) =>
    Number(value.toFixed(6));

const roundStock = (value: number) =>
    Number(value.toFixed(3));

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

    if (purchasedBy && !Types.ObjectId.isValid(purchasedBy)) {
        throw new Error("Invalid user ID");
    }

    const seenMaterials = new Set<string>();

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

        if (seenMaterials.has(item.rawMaterialId)) {
            throw new Error(
                "A raw material can only appear once in a purchase"
            );
        }

        seenMaterials.add(item.rawMaterialId);
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

            const preparedItems: PreparedPurchaseItem[] = [];
            let itemsTotal = 0;

            for (const item of items) {
                const rawMaterial = await RawMaterial.findOne({
                    _id: item.rawMaterialId,
                    isActive: true,
                }).session(session);

                if (!rawMaterial) {
                    throw new Error("Raw material not found or inactive");
                }

                const subtotal = roundMoney(
                    item.quantityGrams * item.costPerGram
                );

                itemsTotal += subtotal;

                preparedItems.push({
                    rawMaterial,
                    quantityGrams: item.quantityGrams,
                    costPerGram: item.costPerGram,
                    subtotal,
                });
            }

            itemsTotal = roundMoney(itemsTotal);

            const totalAmount = roundMoney(
                itemsTotal + additionalCosts
            );

            if (paidAmount > totalAmount) {
                throw new Error(
                    "Paid amount cannot exceed purchase total"
                );
            }

            const paymentStatus =
                paidAmount === 0
                    ? "UNPAID"
                    : paidAmount >= totalAmount
                        ? "PAID"
                        : "PARTIAL";

            let allocatedSoFar = 0;

            const purchaseItems = preparedItems.map((item, index) => {
                let allocation: number;

                if (index === preparedItems.length - 1) {
                    allocation = roundMoney(
                        additionalCosts - allocatedSoFar
                    );
                } else {
                    const weight =
                        itemsTotal > 0
                            ? item.subtotal / itemsTotal
                            : item.quantityGrams /
                              preparedItems.reduce(
                                  (sum, current) =>
                                      sum + current.quantityGrams,
                                  0
                              );

                    allocation = roundMoney(
                        additionalCosts * weight
                    );

                    allocatedSoFar = roundMoney(
                        allocatedSoFar + allocation
                    );
                }

                const landedCostPerGram = roundCost(
                    (item.subtotal + allocation) /
                    item.quantityGrams
                );

                return {
                    rawMaterial: item.rawMaterial._id,
                    materialName: item.rawMaterial.name,
                    quantityGrams: item.quantityGrams,
                    costPerGram: item.costPerGram,
                    subtotal: item.subtotal,
                    allocatedAdditionalCosts: allocation,
                    landedCostPerGram,
                };
            });

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

            for (let index = 0; index < preparedItems.length; index++) {
                const item = preparedItems[index];
                const purchaseItem = purchaseItems[index];
                const rawMaterial = item.rawMaterial;

                const stockBefore = rawMaterial.stockGrams;
                const stockAfter = roundStock(
                    stockBefore + item.quantityGrams
                );

                const oldAverageCost =
                    rawMaterial.averageCostPerGram ?? 0;

                if (stockBefore > 0 && oldAverageCost <= 0) {
                    throw new Error(
                        `Opening cost is missing for ${rawMaterial.name}. ` +
                        "Set its existing stock cost before recording another purchase."
                    );
                }

                const newAverageCost = roundCost(
                    (
                        stockBefore * oldAverageCost +
                        item.quantityGrams *
                            purchaseItem.landedCostPerGram
                    ) / stockAfter
                );

                rawMaterial.stockGrams = stockAfter;
                rawMaterial.averageCostPerGram = newAverageCost;

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
