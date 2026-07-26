import mongoose, { Model, Schema, Types } from "mongoose";
import slugify from "slugify";

interface IProduct {
    name: string;
    slug: string;
    description: string;
    images: string[];
    imagesPublicId: string[];
    category: Types.ObjectId;
    
    createdAt?: Date;
    updatedAt?: Date;
}

const productSchema = new Schema<IProduct, Model<IProduct>>( {
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true  
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    images: {
        type: [String],
        required: true,
        validate: {
            validator: (arr: string[]) => arr.length > 0,
            message: "At least one image is required"
        }
    },
    imagesPublicId: [String],
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }
}, {timestamps: true} )

productSchema.pre("validate", function() {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true
        })
    }
})

productSchema.index( { slug: 1}, { unique: true } );

productSchema.index( { category: 1} );


export const Product = mongoose.model<IProduct>("Product", productSchema)