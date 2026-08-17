import mongoose, { Schema, Types, Model } from "mongoose";

interface IAddress {
    user: Types.ObjectId;
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    landmark: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    addressType: string;
    isDefault: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}


const addressSchema = new Schema<IAddress, Model<IAddress>>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: 100
    },
    phone: {
        type: String,
        required: true,
        match: /^[6-9]\d{9}$/
    },
    street: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },
    landmark: {
        type: String,
        trim: true,
        maxlength: 100
    },
    city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    state: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    country: {
        type: String,
        required: true,
        trim: true,
        default: "India"
    },
    zipCode: {
        type: String,
        match: /^\d{6}$/,
        required: true,
    },
    addressType: {
        type: String,
        enum: ["home", "work", "other"],
        required: true,
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


addressSchema.pre("save", async function() {
  if (this.isDefault) {
    await mongoose.model("Address").updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
})

addressSchema.index(
    { user: 1, isDefault: 1 },
    {
        unique: true,
        partialFilterExpression: {
            isDefault: true
        }
    }
);
addressSchema.index({ city: 1, state: 1 });

export const Address = mongoose.model<IAddress>("Address", addressSchema)