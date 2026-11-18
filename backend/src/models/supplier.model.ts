
import mongoose, { Schema } from "mongoose";

export interface ISupplier {
    name: string;
    contactPerson?: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        contactPerson: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        address: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

supplierSchema.index({ name: 1 });
supplierSchema.index({ phone: 1 });

export const Supplier =
    mongoose.models.Supplier ||
    mongoose.model<ISupplier>("Supplier", supplierSchema);
