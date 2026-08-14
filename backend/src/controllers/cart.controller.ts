import mongoose from "mongoose";
import { Cart, type ICart } from "../models/cart.model.js";
import { Variant } from "../models/variant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const calculateCartTotal = (cart: ICart) => {
    return cart.items.reduce(
        (total, item) =>
            total + item.quantity * item.priceAtAddition,
        0
    );
};

const addItemToCart = asyncHandler( async(req, res) => {

//     Validate input
//         ↓
// Find variant
//         ↓
// Validate stock
//         ↓
// Find user's cart
//         ↓
// Cart exists?
//       /      \
//     No        Yes
//     ↓          ↓
// Create      Search item
//                ↓
//         Item exists?
//           /       \
//         Yes       No
//          ↓         ↓
//  Increase qty   Push item
//          ↓
//       Save cart
//          ↓
//    Return response

    const { variantId } = req.params
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
        throw new ApiError(400, "Quantity must be at least 1");
    }
    
    const variant = await Variant.findById(variantId)
    if (!variant) {
        throw new ApiError(404, "Variant not found")
    }

    if (!variant.isAvailable) {
        throw new ApiError(400, "Variant is not available")
    }

    if (variant.stock < quantity) {
        throw new ApiError(400, "Insufficient stock")
    }

    const userCart = await Cart.findOne({ user: req.user!._id })

    if (!userCart) {
        const cart = await Cart.create({
            user: req.user!._id,
            items: [
                {
                    product: variant.product,
                    variant: variant._id,
                    quantity,
                    priceAtAddition: variant.price
                }
            ],
            
        })

        await cart.populate([
            {
                path: "items.product",
                select: "name slug images"
            },
            {
                path: "items.variant",
                select: "volume price stock"
            }
        ]);

        const totalAmount = calculateCartTotal(cart)
                
        return res.status(201).json(
            new ApiResponse(201, { cart, totalAmount }, "User cart created successfully")
        )
    }

    const existedItem = userCart.items.find(item => 
        item.variant.equals(variant._id)
    )

    if (existedItem) {
        if (existedItem.quantity + quantity <= variant.stock) {
            existedItem.quantity += quantity
        } else {
            throw new ApiError(409, "Insufficient stock")
        }
    }
    else {
        userCart.items.push({
            product: variant.product,
            variant: variant._id,
            quantity,
            priceAtAddition: variant.price
            })
    }

    await userCart.save();
    await userCart.populate("items.product", "name slug images");
    await userCart.populate("items.variant", "volume price stock");

    const totalAmount = calculateCartTotal(userCart)

    return res.status(200).json(
        new ApiResponse(200, { cart: userCart, totalAmount }, "User cart updated successfully")
    )
});

const getCart = asyncHandler( async(req, res) => {
    const userId = req.user!._id

    const cart = await Cart.findOne({ user: userId })
        .populate("items.product", "name slug images")
        .populate("items.variant", "volume price stock")
        .lean();

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    const totalAmount = calculateCartTotal(cart);

    return res.status(200).json(
        new ApiResponse(200, { cart, totalAmount }, "User cart fetched successfully")
    )
});

const removeCartItem = asyncHandler(async (req, res) => {
    const { cartItemId } = req.params;

    const cart = await Cart.findOne({ user: req.user!._id });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter(
        item => !item._id!.equals(cartItemId as string)
    );

    if (cart.items.length === originalLength) {
        throw new ApiError(404, "Cart item not found");
    }

    await cart.save();

    const totalAmount = calculateCartTotal(cart)

    await cart.populate("items.product", "name slug images");
    await cart.populate("items.variant", "volume price stock");

    return res.status(200).json(
        new ApiResponse(200, { cart, totalAmount }, "Cart item removed successfully")
    );
});

const updateCartItem = asyncHandler(async (req, res) => {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        throw new ApiError(400, "Quantity must be at least 1");
    }

    const cart = await Cart.findOne({ user: req.user!._id });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const item = cart.items.find(item =>
        item._id!.equals(cartItemId as string)
    );

    if (!item) {
        throw new ApiError(404, "Cart item not found");
    }

    const variant = await Variant.findById(item.variant);

    if (!variant) {
        throw new ApiError(404, "Variant not found");
    }

    if (!variant.isAvailable) {
        throw new ApiError(400, "Variant is unavailable");
    }

    if (quantity > variant.stock) {
        throw new ApiError(400, "Insufficient stock");
    }

    item.quantity = quantity;

    await cart.save();

    const totalAmount = calculateCartTotal(cart);

    await cart.populate("items.product", "name slug images");
    await cart.populate("items.variant", "volume price stock");

    return res.status(200).json(
        new ApiResponse(200, { cart, totalAmount }, "Cart item updated successfully")
    );
});

const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user!._id });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json(
        new ApiResponse(200, { cart, totalAmount: 0 }, "Cart cleared successfully")
    );
});

const mergeCart = asyncHandler(async (req, res) => {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Cart items are required");
    }

    let cart = await Cart.findOne({
        user: req.user!._id
    });

    if (!cart) {
        cart = await Cart.create({
            user: req.user!._id,
            items: []
        });
    }

    for (const item of items) {
        const { variantId, quantity } = item;

        if (!mongoose.isValidObjectId(variantId)) {
            throw new ApiError(400, "Invalid Variant ID");
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new ApiError(
                400,
                "Quantity must be at least 1"
            );
        }

        const variant = await Variant.findById(variantId);

        if (!variant) {
            throw new ApiError(404, "Variant not found");
        }

        if (!variant.isAvailable) {
            throw new ApiError(400, "Variant is unavailable");
        }

        const existingItem = cart.items.find(
            cartItem => cartItem.variant.equals(variant._id)
        );

        if (existingItem) {
            if (existingItem.quantity + quantity > variant.stock) {
                throw new ApiError(400, "Insufficient stock");
            }

            existingItem.quantity += quantity;
        } else {
            if (quantity > variant.stock) {
                throw new ApiError(400, "Insufficient stock");
            }

            cart.items.push({
                product: variant.product,
                variant: variant._id,
                quantity,
                priceAtAddition: variant.price
            });
        }
    }

    await cart.save();

    await cart.populate([
        {
            path: "items.product",
            select: "name slug images"
        },
        {
            path: "items.variant",
            select: "volume price stock"
        }
    ]);

    const totalAmount = calculateCartTotal(cart);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                cart,
                totalAmount
            },
            "Cart merged successfully"
        )
    );
});

export {
    addItemToCart,
    getCart,
    removeCartItem,
    updateCartItem,
    clearCart,
    mergeCart
}