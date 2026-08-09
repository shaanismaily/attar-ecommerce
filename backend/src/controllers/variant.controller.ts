import { Product } from "../models/product.model.js";
import { Variant } from "../models/variant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createVariant = asyncHandler(async (req, res) => {
  const { productId, volume, price, isAvailable, stock } = req.body;

  if (
    !productId ||
    volume === undefined ||
    price === undefined ||
    stock === undefined
  ) {
    throw new ApiError(400, "Product, volume, price and stock are required");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const variant = await Variant.create({
    product: productId,
    volume,
    price,
    isAvailable: isAvailable ?? true,
    stock,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, variant, "Variant created successfully"));
});

const updateVariant = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const { product, volume, price, stock, isAvailable } = req.body;

  if (
    product === undefined &&
    volume === undefined &&
    price === undefined &&
    stock === undefined &&
    isAvailable === undefined
  ) {
    throw new ApiError(400, "At least one field is required");
  }

  const variant = await Variant.findById(variantId);
  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  if (product !== undefined) {
    const productExists = await Product.exists({
      _id: product,
    });

    if (!productExists) {
      throw new ApiError(404, "Product not found");
    }

    variant.product = product;
  }

  if (volume !== undefined) {
    variant.volume = volume;
  }
  if (price !== undefined) {
    variant.price = price;
  }
  if (stock !== undefined) {
    variant.stock = stock;
  }
  if (isAvailable !== undefined) {
    variant.isAvailable = isAvailable;
  }

  await variant.save();

  return res
    .status(200)
    .json(new ApiResponse(200, variant, "Variant updated successfully"));
});

const getVariants = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.exists({
    _id: productId,
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const variants = await Variant.find({
    product: productId,
  }).sort({ volume: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, variants, "Variants fetched successfully"));
});

export { createVariant, updateVariant, getVariants };
