import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import slugify from "slugify";

const createProduct = asyncHandler( async(req, res) => {
    const { name, description, categoryId } = req.body

    if (!name || !description) {
        throw new ApiError(400, "All fields are required");
    }

    if (
        !name.trim() ||
        !description.trim()
    ) {
        throw new ApiError(400, "Invalid input");
    }

    const generatedSlug = slugify(name, {
        lower: true,
        strict: true
    });

    const existedProduct = await Product.findOne({ generatedSlug });

    if (existedProduct) {
        throw new ApiError(409, "Product already exists");
    }

    const category = await Category.findById(categoryId)
    if (!category) {
        throw new ApiError(404, "Category not found")
    }

    const imageFiles = req.files as Express.Multer.File[];

    if (!imageFiles || imageFiles.length === 0) {
        throw new ApiError(400, "At least one image is required")
    }

    const imageUrls: string[] = [];
    const imagePublicIds: string[] = [];

    for (const file of imageFiles) {
        const uploadedImage = await uploadOnCloudinary(file.path)
        if (!uploadedImage) {
            throw new ApiError(400, "Image is required")
        }

        imageUrls.push(uploadedImage.secure_url)
        imagePublicIds.push(uploadedImage.public_id)
    }

    const product = await Product.create({
        name,
        description,
        category: categoryId,
        images: imageUrls,
        imagesPublicId: imagePublicIds
    })

    if (!product) {
        throw new ApiError(500, "Something went wrong while creating a product")
    }

    const createdProduct = await Product.findById(product._id)
        .populate("category", "name description image isActive slug")

    return res.status(201).json(
        new ApiResponse(201, createdProduct, "Product created successfully")
    );
})

const updateProduct = asyncHandler( async(req, res) => {
    const { name, description, category } = req.body
    const { productId } = req.params

    if (!name && !description && !category) {
        throw new ApiError(400, "At least one field is required")
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (name !== undefined) {
        const newSlug = slugify(name, {
            lower: true,
            strict: true
        });

        const existingProduct = await Product.findOne({
            slug: newSlug,
            _id: { $ne: product._id }
        });

        if (existingProduct) {
            throw new ApiError(409, "A product with this name already exists");
        }

        product.name = name; // pre("validate") regenerates product.slug
    }

    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;

    await product.save();

    return res.status(200).json(
        new ApiResponse(200, product, "Product updated successfully")
    )
})

const deleteProduct = asyncHandler( async(req, res) => {
    const { productId } = req.params

    const deletedProduct = await Product.findByIdAndDelete(productId)

    if (!deletedProduct) {
        throw new ApiError(404, "Product not found")
    }

    for (const publicId of deletedProduct.imagesPublicId) {
        deleteFromCloudinary(publicId)
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Product deleted successfully")
    )
})

const getProducts = asyncHandler( async(req, res) => {
    const { page="1", limit="10", query, sortBy, sortType, category } = req.query

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));

    const filter: Record<string, unknown> = {}

    if (query) {
        filter.$or = [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }

    if (category) {
        filter.category = category
    }

    const allowedSortFields = ["name", "createdAt"] as const;

    const sortField = allowedSortFields.includes(sortBy as any) ? sortBy as string : "createdAt" 
    const order = sortType === "asc" ? 1 : -1;


    const products = await Product.find(filter)
                    .populate("category")
                    .sort({ [sortField]: order })
                    .skip((pageNumber -1) * limitNumber)
                    .limit(limitNumber)

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limitNumber);

    return res.status(200).json(
        new ApiResponse(200, {
            products,
            page: pageNumber,
            limit: limitNumber,
            totalProducts,
            totalPages
        }, "Products fetched successfully")
    )
})

const getProduct = asyncHandler( async(req, res) => {
    const { slug } = req.params

    const product = await Product.findOne({ slug }).populate("category")

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    return res.status(200).json(
        new ApiResponse(200, product, "Product fetched successfully")
    )
})

export {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getProduct
}