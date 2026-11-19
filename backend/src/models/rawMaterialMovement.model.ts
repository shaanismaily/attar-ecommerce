
import mongoose, { Schema } from "mongoose";

export interface IRawMaterialMovement {
    rawMaterial: mongoose.Types.ObjectId;
    movementType: "PURCHASE" | "BOTTLING" | "ADJUSTMENT";
    direction: "IN" | "OUT";
    quantityGrams: number;
    stockBefore: number;
    stockAfter: number;
    referenceType: "PURCHASE" | "PRODUCTION_BATCH" | "MANUAL";
    referenceId?: mongoose.Types.ObjectId;
    performedBy?: mongoose.Types.ObjectId;
    note?: string;
    createdAt: Date;
}

const rawMaterialMovementSchema = new Schema<IRawMaterialMovement>(
    {
        rawMaterial: {
            type: Schema.Types.ObjectId,
            ref: "RawMaterial",
            required: true,
        },
        movementType: {
            type: String,
            enum: ["PURCHASE", "BOTTLING", "ADJUSTMENT"],
            required: true,
        },
        direction: {
            type: String,
            enum: ["IN", "OUT"],
            required: true,
        },
        quantityGrams: {
            type: Number,
            required: true,
            min: 0.001,
        },
        stockBefore: {
            type: Number,
            required: true,
            min: 0,
        },
        stockAfter: {
            type: Number,
            required: true,
            min: 0,
        },
        referenceType: {
            type: String,
            enum: ["PURCHASE", "PRODUCTION_BATCH", "MANUAL"],
            required: true,
        },
        referenceId: {
            type: Schema.Types.ObjectId,
        },
        performedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        note: {
            type: String,
            trim: true,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

rawMaterialMovementSchema.index({ rawMaterial: 1, createdAt: -1 });
rawMaterialMovementSchema.index({ referenceType: 1, referenceId: 1 });

export const RawMaterialMovement =
    mongoose.models.RawMaterialMovement ||
    mongoose.model<IRawMaterialMovement>(
        "RawMaterialMovement",
        rawMaterialMovementSchema
    );
