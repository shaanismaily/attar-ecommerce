
import mongoose, { Types } from "mongoose";
import { RawMaterial } from "../models/rawMaterial.model.js";
import { ProductionBatch } from "../models/productionBatch.model.js";
import { RawMaterialMovement } from "../models/rawMaterialMovement.model.js";
import { Variant } from "../models/variant.model.js";
import { default as StockMovement } from "../models/stockMovement.model.js";

interface ProductionOutputInput {
    variantId: string;
    bottleCount: number;
}

interface CreateProductionInput {
    rawMaterialId: string;
    outputs: ProductionOutputInput[];
    productionDate?: Date;
    notes?: string;
    producedBy?: string;
}

export const createProductionBatch = async (
    input: CreateProductionInput
) => {
    const {
        rawMaterialId,
        outputs,
        productionDate,
        notes,
        producedBy,
    } = input;

    if (!Types.ObjectId.isValid(rawMaterialId)) {
        throw new Error("Invalid raw material ID");
    }

    if (!Array.isArray(outputs) || outputs.length === 0) {
        throw new Error("At least one production output is required");
    }

    if (
        producedBy &&
        !Types.ObjectId.isValid(producedBy)
    ) {
        throw new Error("Invalid user ID");
    }

    for (const output of outputs) {
        if (
            !Types.ObjectId.isValid(output.variantId) ||
            !Number.isInteger(output.bottleCount) ||
            output.bottleCount <= 0
        ) {
            throw new Error("Invalid variant or bottle count");
        }
    }

    const session = await mongoose.startSession();

    try {
        let createdBatchId: Types.ObjectId | undefined;

        await session.withTransaction(async () => {
            const rawMaterial = await RawMaterial.findOne({
                _id: rawMaterialId,
                isActive: true,
            }).session(session);

            if (!rawMaterial) {
                throw new Error("Raw material not found or inactive");
            }

            const density = rawMaterial.densityGramsPerMl;

            const variantIds = outputs.map(
                (output) => output.variantId
            );

            const uniqueVariantIds = new Set(variantIds);

            if (uniqueVariantIds.size !== variantIds.length) {
                throw new Error(
                    "Duplicate variants are not allowed in one batch"
                );
            }

            const outputRecords = [];
            let totalVolumeMl = 0;

            for (const output of outputs) {
                const variant = await Variant.findById(
                    output.variantId
                ).session(session);

                if (!variant) {
                    throw new Error("Variant not found");
                }

                const totalOutputVolume =
                    variant.volume * output.bottleCount;

                totalVolumeMl += totalOutputVolume;

                outputRecords.push({
                    variant,
                    volumeMl: variant.volume,
                    bottleCount: output.bottleCount,
                    totalVolumeMl: totalOutputVolume,
                });
            }

            const consumedGrams = totalVolumeMl * density;

            const stockBefore = rawMaterial.stockGrams;

            if (stockBefore < consumedGrams) {
                throw new Error(
                    `Insufficient bulk stock. Available: ${stockBefore}g, Required: ${consumedGrams}g`
                );
            }

            const stockAfter = stockBefore - consumedGrams;

            // Conditionally deduct bulk stock to prevent overselling.
            const rawStockUpdate = await RawMaterial.updateOne(
                {
                    _id: rawMaterial._id,
                    stockGrams: { $gte: consumedGrams },
                },
                {
                    $inc: {
                        stockGrams: -consumedGrams,
                    },
                },
                { session }
            );

            if (rawStockUpdate.modifiedCount !== 1) {
                throw new Error(
                    "Bulk stock changed. Please retry production."
                );
            }

            const [batch] = await ProductionBatch.create(
                [
                    {
                        rawMaterial: rawMaterial._id,
                        materialName: rawMaterial.name,
                        densityGramsPerMl: density,
                        totalVolumeMl,
                        consumedGrams,
                        outputs: outputRecords.map((output) => ({
                            variant: output.variant._id,
                            volumeMl: output.volumeMl,
                            bottleCount: output.bottleCount,
                            totalVolumeMl: output.totalVolumeMl,
                        })),
                        productionDate: productionDate ?? new Date(),
                        notes,
                        producedBy,
                    },
                ],
                { session }
            );

            await RawMaterialMovement.create(
                [
                    {
                        rawMaterial: rawMaterial._id,
                        movementType: "BOTTLING",
                        direction: "OUT",
                        quantityGrams: consumedGrams,
                        stockBefore,
                        stockAfter,
                        referenceType: "PRODUCTION_BATCH",
                        referenceId: batch._id,
                        performedBy: producedBy,
                        note: `Bulk fragrance used for bottling`,
                    },
                ],
                { session }
            );

            for (const output of outputRecords) {
                const variant = output.variant;
                const variantStockBefore = variant.stock;
                const variantStockAfter =
                    variantStockBefore + output.bottleCount;

                const variantUpdate = await Variant.updateOne(
                    {
                        _id: variant._id,
                        stock: variantStockBefore,
                    },
                    {
                        $inc: {
                            stock: output.bottleCount,
                        },
                    },
                    { session }
                );

                if (variantUpdate.modifiedCount !== 1) {
                    throw new Error(
                        "Variant stock changed. Please retry production."
                    );
                }

                await StockMovement.create(
                    [
                        {
                            product: variant.product,
                            variant: variant._id,
                            movementType: "PURCHASE",
                            direction: "IN",
                            quantity: output.bottleCount,
                            stockBefore: variantStockBefore,
                            stockAfter: variantStockAfter,
                            referenceType: "MANUAL",
                            referenceId: batch._id,
                            performedBy: producedBy,
                            note: "Finished stock added through bottling",
                        },
                    ],
                    { session }
                );
            }

            createdBatchId = batch._id;
        });

        if (!createdBatchId) {
            throw new Error("Production batch creation failed");
        }

        return await ProductionBatch.findById(createdBatchId)
            .populate("rawMaterial", "name")
            .populate({
                path: "outputs.variant",
                select: "volume stock price product",
                populate: {
                    path: "product",
                    select: "name",
                },
            })
            .lean();
    } finally {
        await session.endSession();
    }
};
