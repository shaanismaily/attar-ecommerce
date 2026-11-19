
import mongoose, { Schema } from "mongoose";

export interface IProductionOutput {
    variant: mongoose.Types.ObjectId;
    volumeMl: number;
    bottleCount: number;
    totalVolumeMl: number;
}

export interface IProductionBatch {
    rawMaterial: mongoose.Types.ObjectId;
    materialName: string;
    densityGramsPerMl: number;
    totalVolumeMl: number;
    consumedGrams: number;
    outputs: IProductionOutput[];
    productionDate: Date;
    notes?: string;
    producedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const productionOutputSchema = new Schema<IProductionOutput>(
    {
        variant: {
            type: Schema.Types.ObjectId,
            ref: "Variant",
            required: true,
        },
        volumeMl: {
            type: Number,
            required: true,
            min: 0.001,
        },
        bottleCount: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "Bottle count must be a whole number",
            },
        },
        totalVolumeMl: {
            type: Number,
            required: true,
            min: 0.001,
        },
    },
    { _id: false }
);

const productionBatchSchema = new Schema<IProductionBatch>(
    {
        rawMaterial: {
            type: Schema.Types.ObjectId,
            ref: "RawMaterial",
            required: true,
        },
        materialName: {
            type: String,
            required: true,
            trim: true,
        },
        densityGramsPerMl: {
            type: Number,
            required: true,
            min: 0.000001,
        },
        totalVolumeMl: {
            type: Number,
            required: true,
            min: 0.001,
        },
        consumedGrams: {
            type: Number,
            required: true,
            min: 0.001,
        },
        outputs: {
            type: [productionOutputSchema],
            required: true,
            validate: {
                validator: (outputs: IProductionOutput[]) =>
                    outputs.length > 0,
                message: "A production batch must contain at least one output",
            },
        },
        productionDate: {
            type: Date,
            default: Date.now,
        },
        notes: {
            type: String,
            trim: true,
        },
        producedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

productionBatchSchema.index({ rawMaterial: 1, productionDate: -1 });

export const ProductionBatch =
    mongoose.models.ProductionBatch ||
    mongoose.model<IProductionBatch>(
        "ProductionBatch",
        productionBatchSchema
    );
