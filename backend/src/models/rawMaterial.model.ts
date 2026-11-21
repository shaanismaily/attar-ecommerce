
import mongoose, { Schema } from "mongoose";

export interface IRawMaterial {
    name: string;
    sku?: string;
    densityGramsPerMl: number;
    stockGrams: number;
    product: mongoose.Types.ObjectId;
    minimumStockGrams: number;
    isActive: boolean;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const rawMaterialSchema = new Schema<IRawMaterial>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        sku: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },
        densityGramsPerMl: {
            type: Number,
            required: true,
            min: 0.000001,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
        },
        stockGrams: {
            type: Number,
            default: 0,
            min: 0,
        },
        minimumStockGrams: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

rawMaterialSchema.index({ name: 1 });

export const RawMaterial =
    mongoose.models.RawMaterial ||
    mongoose.model<IRawMaterial>("RawMaterial", rawMaterialSchema);
