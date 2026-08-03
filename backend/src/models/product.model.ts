import mongoose, { Model, Schema, Types } from "mongoose";
import slugify from "slugify";

interface IProduct {
    name: string;
    slug: string;
    description: string;
    isFeatured: boolean;
    isBestSeller: boolean;
    isNewArrival: boolean;
    isPublished: boolean;
    images: [
        {
            url: string;
            publicId: string
        }
    ];
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
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isBestSeller: {
        type: Boolean,
        default: false,
    },
    isNewArrival: {
        type: Boolean,
        default: false,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    images: [
        {
            url: {
                type: String,
                required: true
            },
            publicId: {
                type: String,
                required: true
            },
        }
    ],
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

productSchema.index( { category: 1} );
productSchema.index( { isFeatured: 1} );
productSchema.index( { isBestSeller: 1} );
productSchema.index( { isNewArrival: 1} );


export const Product = mongoose.model<IProduct>("Product", productSchema)