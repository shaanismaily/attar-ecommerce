
import mongoose, { Schema } from "mongoose";

export interface IPurchaseItem {
    rawMaterial: mongoose.Types.ObjectId;
    materialName: string;
    quantityGrams: number;
    costPerGram: number;
    subtotal: number;
    allocatedAdditionalCosts: number;
    landedCostPerGram: number;
}

export interface IPurchase {
    supplier: mongoose.Types.ObjectId;
    items: IPurchaseItem[];
    additionalCosts: number;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
    purchaseDate: Date;
    notes?: string;
    purchasedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const purchaseItemSchema = new Schema<IPurchaseItem>(
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
        quantityGrams: {
            type: Number,
            required: true,
            min: 0.001,
        },
        costPerGram: {
            type: Number,
            required: true,
            min: 0,
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        allocatedAdditionalCosts: {
            type: Number,
            required: true,
            min: 0,
        },
        landedCostPerGram: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const purchaseSchema = new Schema<IPurchase>(
    {
        supplier: {
            type: Schema.Types.ObjectId,
            ref: "Supplier",
            required: true,
        },
        items: {
            type: [purchaseItemSchema],
            required: true,
            validate: {
                validator: (items: IPurchaseItem[]) => items.length > 0,
                message: "A purchase must contain at least one item",
            },
        },
        additionalCosts: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        paidAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        paymentStatus: {
            type: String,
            enum: ["PAID", "PARTIAL", "UNPAID"],
            default: "UNPAID",
        },
        purchaseDate: {
            type: Date,
            default: Date.now,
        },
        notes: {
            type: String,
            trim: true,
        },
        purchasedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

purchaseSchema.index({ supplier: 1, purchaseDate: -1 });

export const Purchase =
    mongoose.models.Purchase ||
    mongoose.model<IPurchase>("Purchase", purchaseSchema);
