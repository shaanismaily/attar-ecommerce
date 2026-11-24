
import mongoose, { Schema } from "mongoose";

export const expenseCategories = [
    "RENT",
    "ELECTRICITY",
    "PACKAGING",
    "TRANSPORT",
    "COURIER",
    "MARKETING",
    "MAINTENANCE",
    "OFFICE",
    "OTHER",
] as const;

export const expensePaymentMethods = [
    "CASH",
    "UPI",
    "CARD",
    "BANK_TRANSFER",
] as const;

export interface IExpense {
    category: typeof expenseCategories[number];
    description: string;
    amount: number;
    paymentMethod: typeof expensePaymentMethods[number];
    expenseDate: Date;
    vendorName?: string;
    referenceNumber?: string;
    notes?: string;
    recordedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
    {
        category: {
            type: String,
            enum: expenseCategories,
            required: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0.01,
        },
        paymentMethod: {
            type: String,
            enum: expensePaymentMethods,
            required: true,
        },
        expenseDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        vendorName: {
            type: String,
            trim: true,
        },
        referenceNumber: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        recordedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

expenseSchema.index({ expenseDate: -1 });
expenseSchema.index({ category: 1, expenseDate: -1 });

export const Expense =
    mongoose.models.Expense ||
    mongoose.model<IExpense>("Expense", expenseSchema);
