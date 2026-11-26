import mongoose, { Types } from "mongoose";
import { RawMaterial } from "../models/rawMaterial.model.js";
import { ProductionBatch } from "../models/productionBatch.model.js";
import { RawMaterialMovement } from "../models/rawMaterialMovement.model.js";
import { Variant } from "../models/variant.model.js";
import { default as StockMovement } from "../models/stockMovement.model.js";
import { ApiError } from "../utils/ApiError.js";

interface ProductionOutputInput {
  variantId: string;
  bottleCount: number;
  packagingCostPerBottle: number;
}

interface CreateProductionInput {
  rawMaterialId: string;
  outputs: ProductionOutputInput[];
  productionDate?: Date;
  notes?: string;
  producedBy?: string;
}

const roundCost = (value: number) => Number(value.toFixed(4));

const roundStock = (value: number) => Number(value.toFixed(3));

export const createProductionBatch = async (input: CreateProductionInput) => {
  const { rawMaterialId, outputs, productionDate, notes, producedBy } = input;

  if (!Types.ObjectId.isValid(rawMaterialId)) {
    throw new Error("Invalid raw material ID");
  }

  if (!Array.isArray(outputs) || outputs.length === 0) {
    throw new Error("At least one production output is required");
  }

  if (producedBy && !Types.ObjectId.isValid(producedBy)) {
    throw new Error("Invalid user ID");
  }

  for (const output of outputs) {
    if (
      !Types.ObjectId.isValid(output.variantId) ||
      !Number.isInteger(output.bottleCount) ||
      output.bottleCount <= 0 ||
      !Number.isFinite(output.packagingCostPerBottle) ||
      output.packagingCostPerBottle < 0
    ) {
      throw new Error("Invalid variant, bottle count or packaging cost");
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
      const averageCostPerGram = rawMaterial.averageCostPerGram;

      if (!Number.isFinite(averageCostPerGram) || averageCostPerGram <= 0) {
        throw new ApiError(
          400,
          "Raw material average cost is missing. Initialize its opening cost before production."
        );
      }

      const variantIds = outputs.map((output) => output.variantId);

      if (new Set(variantIds).size !== variantIds.length) {
        throw new Error("Duplicate variants are not allowed in one batch");
      }

      const outputRecords = [];
      let totalVolumeMl = 0;

      for (const output of outputs) {
        const variant = await Variant.findById(output.variantId).session(
          session
        );

        if (!variant) {
          throw new Error("Variant not found");
        }

        if (variant.product.toString() !== rawMaterial.product.toString()) {
          throw new ApiError(
            400,
            `Variant ${variant._id} does not belong to raw material ${rawMaterial.name}`
          );
        }

        const totalOutputVolume = variant.volume * output.bottleCount;

        const fragranceCostPerBottle = roundCost(
          variant.volume * density * averageCostPerGram
        );

        const totalCostPerBottle = roundCost(
          fragranceCostPerBottle + output.packagingCostPerBottle
        );

        const totalOutputCost = roundCost(
          totalCostPerBottle * output.bottleCount
        );

        totalVolumeMl += totalOutputVolume;

        outputRecords.push({
          variant,
          volumeMl: variant.volume,
          bottleCount: output.bottleCount,
          totalVolumeMl: totalOutputVolume,
          packagingCostPerBottle: output.packagingCostPerBottle,
          fragranceCostPerBottle,
          totalCostPerBottle,
          totalOutputCost,
        });
      }

      const consumedGrams = roundStock(totalVolumeMl * density);

      const stockBefore = rawMaterial.stockGrams;

      if (stockBefore < consumedGrams) {
        throw new Error(
          `Insufficient bulk stock. Available: ${stockBefore}g, Required: ${consumedGrams}g`
        );
      }

      const stockAfter = roundStock(stockBefore - consumedGrams);

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
        throw new Error("Bulk stock changed. Please retry production.");
      }

      const totalFragranceCost = roundCost(
        outputRecords.reduce(
          (sum, output) =>
            sum + output.fragranceCostPerBottle * output.bottleCount,
          0
        )
      );

      const totalPackagingCost = roundCost(
        outputRecords.reduce(
          (sum, output) =>
            sum + output.packagingCostPerBottle * output.bottleCount,
          0
        )
      );

      const totalProductionCost = roundCost(
        totalFragranceCost + totalPackagingCost
      );

      const [batch] = await ProductionBatch.create(
        [
          {
            rawMaterial: rawMaterial._id,
            materialName: rawMaterial.name,
            densityGramsPerMl: density,
            averageCostPerGramSnapshot: averageCostPerGram,
            totalVolumeMl,
            consumedGrams,
            totalFragranceCost,
            totalPackagingCost,
            totalProductionCost,
            outputs: outputRecords.map((output) => ({
              variant: output.variant._id,
              volumeMl: output.volumeMl,
              bottleCount: output.bottleCount,
              totalVolumeMl: output.totalVolumeMl,
              packagingCostPerBottle: output.packagingCostPerBottle,
              fragranceCostPerBottle: output.fragranceCostPerBottle,
              totalCostPerBottle: output.totalCostPerBottle,
              totalOutputCost: output.totalOutputCost,
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
            note: "Bulk fragrance used for bottling",
          },
        ],
        { session }
      );

      for (const output of outputRecords) {
        const variant = output.variant;

        const variantStockBefore = variant.stock;
        const variantStockAfter = variantStockBefore + output.bottleCount;

        const oldAverageCost = variant.averageCostPerUnit ?? 0;

        if (variantStockBefore > 0 && oldAverageCost <= 0) {
          throw new ApiError(
            400,
            `Opening inventory cost is missing for ${variant.volume} ml variant. Initialize its existing stock cost before production.`
          );
        }

        const newAverageCost = roundCost(
          (variantStockBefore * oldAverageCost +
            output.bottleCount * output.totalCostPerBottle) /
            variantStockAfter
        );

        const variantUpdate = await Variant.updateOne(
          {
            _id: variant._id,
            stock: variantStockBefore,
          },
          {
            $inc: {
              stock: output.bottleCount,
            },
            $set: {
              averageCostPerUnit: newAverageCost,
            },
          },
          { session }
        );

        if (variantUpdate.modifiedCount !== 1) {
          throw new Error("Variant stock changed. Please retry production.");
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
        select: "volume stock price averageCostPerUnit product",
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
