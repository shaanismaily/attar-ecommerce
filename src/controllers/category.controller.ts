import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const createCategory = asyncHandler( async(req, res) => {
    const { name, description, isActive } = req.body

    if (!name || !description) {
        throw new ApiError(400, "All fields are required")
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        throw new ApiError(409, "Category already exists")
    }

    const imageLocalPath = req.file?.path
    if (!imageLocalPath) {
        throw new ApiError(400, "Image is required")
    }

    const imageFile = await uploadOnCloudinary(imageLocalPath)
    if (!imageFile) {
        throw new ApiError(500, "Image upload failed")
    }

    const isActiveValue =
    isActive === undefined
        ? true
        : isActive === "true" || isActive === true;

    const category = await Category.create({
        name,
        description,
        isActive: isActiveValue,
        image: imageFile.secure_url,
        imagePublicId: imageFile.public_id
    })

    return res.status(201).json(
        new ApiResponse(201, category, "Category created successfully")
    )
})

const getAllCategories = asyncHandler(async (_, res) => {
    const categories = await Category.find().sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, categories, "All categories fetched successfully")
    )
});

const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.categoryId);

    if (!category) throw new ApiError(404, "Category not found");

    return res.status(200).json(
        new ApiResponse(200, category, "Category fetched successfully")
    );
});

const updateCategory = asyncHandler(async (req, res) => {
    const { name, description, isActive } = req.body;

    if (name === undefined && description === undefined && isActive === undefined) {
        throw new ApiError(400, "At least one field is required");
    }

    const category = await Category.findById(req.params.categoryId);

    if (!category) throw new ApiError(404, "Category not found");

    if (name !== undefined) {
        if (!name.trim()) throw new ApiError(400, "Category name cannot be empty");

        const existingCategory = await Category.findOne({
            name,
            _id: { $ne: category._id }
        });

        if (existingCategory) throw new ApiError(409, "Category already exists");

        category.name = name;
    }

    if (description !== undefined) {
        if (!description.trim()) throw new ApiError(400, "Category description cannot be empty");
        category.description = description;
    }

    if (isActive !== undefined) {
        category.isActive = isActive === "true" || isActive === true;
    }

    await category.save();

    return res.status(200).json(
        new ApiResponse(200, category, "Category updated successfully")
    );
});

const updateImage = asyncHandler(async (req, res) => {
    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) throw new ApiError(400, "Image is required");

    const category = await Category.findById(req.params.categoryId);

    if (!category) throw new ApiError(404, "Category not found");

    const uploadedImage = await uploadOnCloudinary(imageLocalPath);

    if (!uploadedImage) throw new ApiError(500, "Image upload failed");

    const oldImagePublicId = category.imagePublicId;
    category.image = uploadedImage.secure_url;
    category.imagePublicId = uploadedImage.public_id;
    await category.save();

    if (oldImagePublicId) await deleteFromCloudinary(oldImagePublicId);

    return res.status(200).json(
        new ApiResponse(200, category, "Category image updated successfully")
    );
});

const deleteCategory = asyncHandler(async (req, res) => {
    const deletedCategory = await Category.findByIdAndDelete(req.params.categoryId);

    if (!deletedCategory) throw new ApiError(404, "Category not found");

    if (deletedCategory.imagePublicId) {
        await deleteFromCloudinary(deletedCategory.imagePublicId);
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Category deleted successfully")
    );
});

export {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    updateImage,
    deleteCategory
}
