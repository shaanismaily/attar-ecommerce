
import mongoose, { Schema, Types } from "mongoose";

const movementTypes = [
    "PURCHASE",
    "POS_SALE",
    "ONLINE_ORDER",
    "ORDER_CANCELLATION",
    "CUSTOMER_RETURN",
    "DAMAGE",
    "ADJUSTMENT",
] as const;

const directions = ["IN", "OUT"] as const;

const referenceTypes = [
    "PURCHASE",
    "ORDER",
    "SALE",
    "MANUAL",
] as const;

interface IStockMovement {
    product: Types.ObjectId;
    variant: Types.ObjectId;
    movementType: typeof movementTypes[number];
    direction: typeof directions[number];
    quantity: number;
    stockBefore: number;
    stockAfter: number;
    referenceType?: typeof referenceTypes[number];
    referenceId?: Types.ObjectId;
    performedBy?: Types.ObjectId;
    note?: string;
}

const stockMovementSchema = new Schema<IStockMovement>(
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
        movementType: {
            type: String,
            enum: movementTypes,
            required: true,
        },
        direction: {
            type: String,
            enum: directions,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "Quantity must be an integer",
            },
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
            enum: referenceTypes,
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
    { timestamps: true }
);

// Ensure the recorded stock balance is mathematically consistent.
stockMovementSchema.pre("validate", function () {
    const expectedStock =
        this.direction === "IN"
            ? this.stockBefore + this.quantity
            : this.stockBefore - this.quantity;

    if (expectedStock < 0 || this.stockAfter !== expectedStock) {
        this.invalidate(
            "stockAfter",
            "Stock balance does not match the movement"
        );
    }
});

// Useful for inventory history and reporting.
stockMovementSchema.index({ variant: 1, createdAt: -1 });
stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ referenceType: 1, referenceId: 1 });

const StockMovement =
    mongoose.models.StockMovement ||
    mongoose.model<IStockMovement>("StockMovement", stockMovementSchema);

export default StockMovement;
