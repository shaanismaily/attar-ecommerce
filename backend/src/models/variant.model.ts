import mongoose, {Schema, Types, Model} from "mongoose";

type VolumeType = 3 | 6 | 12

interface IVariant {
    product: Types.ObjectId;
    volume: VolumeType;
    price: number;
    stock: number;
    isAvailable: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

const variantSchema = new Schema<IVariant, Model<IVariant>>({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    volume: {
        type: Number,
        enum: [3 , 6, 12],
        default: 3,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

variantSchema.index(
    { product: 1, volume: 1 },
    { unique: true }
);

export const Variant = mongoose.model<IVariant>("Variant", variantSchema)