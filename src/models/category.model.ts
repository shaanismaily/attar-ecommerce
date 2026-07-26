import mongoose, { Schema, Model } from "mongoose";
import slugify from "slugify";

interface ICategory {
    name: string;
    slug: string;
    description: string;
    image: string;
    isActive: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

const categorySchema = new Schema<ICategory, Model<ICategory>>({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxlength: 50,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    image: {
        type: String,
        match: /^https?:\/\/.+/,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

categorySchema.pre("validate", function() {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true
        });
    }
})

export const Category = mongoose.model<ICategory>("Category", categorySchema)