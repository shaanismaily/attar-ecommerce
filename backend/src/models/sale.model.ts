
import mongoose, { Schema } from "mongoose";

export interface ISaleItem {
    product: mongoose.Types.ObjectId;
    variant: mongoose.Types.ObjectId;
    productName: string;
    volume: number;
    price: number;
    sellingPrice: number;
    quantity: number;
    subtotal: number;
}

export interface ISale {
    receiptNumber: string;
    items: ISaleItem[];
    subtotal: number;
    discount: number;
    totalAmount: number;
    amountReceived: number;
    changeReturned: number;
    paymentMethod: "CASH" | "UPI" | "CARD" | "SPLIT";
    customer?: mongoose.Types.ObjectId;
    soldBy: mongoose.Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        variant: {
            type: Schema.Types.ObjectId,
            ref: "Variant",
            required: true,
        },
        productName: {
            type: String,
            required: true,
            trim: true,
        },
        volume: {
            type: Number,
            required: true,
            enum: [3, 6, 12],
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            validate: Number.isInteger,
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const saleSchema = new Schema<ISale>(
    {
        receiptNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        items: {
            type: [saleItemSchema],
            required: true,
            validate: {
                validator: (items: ISaleItem[]) => items.length > 0,
                message: "A sale must contain at least one item",
            },
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        amountReceived: {
            type: Number,
            required: true,
            min: 0,
        },
        changeReturned: {
            type: Number,
            default: 0,
            min: 0,
        },
        paymentMethod: {
            type: String,
            enum: ["CASH", "UPI", "CARD", "SPLIT"],
            required: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        soldBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

saleSchema.index({ createdAt: -1 });
saleSchema.index({ customer: 1, createdAt: -1 });
saleSchema.index({ soldBy: 1, createdAt: -1 });

export const Sale =
    mongoose.models.Sale ||
    mongoose.model<ISale>("Sale", saleSchema);
