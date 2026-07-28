import mongoose, { Schema, Types, Model } from "mongoose";

interface ICartItem {
    _id?: Types.ObjectId;
    product: Types.ObjectId;
    variant: Types.ObjectId;

    quantity: number;
    priceAtAddition: number;
}

interface ICart {
    user: Types.ObjectId;
    items: ICartItem[];

    createdAt?: Date;
    updatedAt?: Date;
}

const cartItemSchema = new Schema<ICartItem>({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    variant: {
        type: Schema.Types.ObjectId,
        ref: "Variant",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    priceAtAddition: {
        type: Number,
        required: true,
        min: 0
    }
})

const cartSchema = new Schema<ICart, Model<ICart>>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    items: [cartItemSchema]
}, { timestamps: true })


export const Cart = mongoose.model<ICart>("Cart", cartSchema)