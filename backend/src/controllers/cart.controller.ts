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

    /*
     * ----------------------------------------------------
     * 1. Validate input + combine duplicate variants
     * ----------------------------------------------------
     */

    const quantityMap = new Map<string, number>();

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

        const id = variantId.toString();

        quantityMap.set(
            id,
            (quantityMap.get(id) || 0) + quantity
        );
    }

    const variantIds = [...quantityMap.keys()];

    /*
     * ----------------------------------------------------
     * 2. Fetch ALL variants in ONE query
     * ----------------------------------------------------
     */

    const variants = await Variant.find({
        _id: { $in: variantIds }
    }).lean();

    /*
     * ----------------------------------------------------
     * 3. Create O(1) lookup map
     * ----------------------------------------------------
     */

    const variantMap = new Map(
        variants.map(variant => [
            variant._id.toString(),
            variant
        ])
    );

    /*
     * ----------------------------------------------------
     * 4. Validate every guest cart item
     * ----------------------------------------------------
     */

    for (const [variantId, quantity] of quantityMap) {
        const variant = variantMap.get(variantId);

        if (!variant) {
            throw new ApiError(
                404,
                `Variant ${variantId} not found`
            );
        }

        if (!variant.isAvailable) {
            throw new ApiError(
                400,
                "One or more variants are unavailable"
            );
        }

        if (quantity > variant.stock) {
            throw new ApiError(
                400,
                "Insufficient stock"
            );
        }
    }

    /*
     * ----------------------------------------------------
     * 5. Get user's existing cart
     * ----------------------------------------------------
     */

    let cart = await Cart.findOne({
        user: req.user!._id
    });

    /*
     * ----------------------------------------------------
     * 6. Create cart if it doesn't exist
     * ----------------------------------------------------
     */

    if (!cart) {
        cart = new Cart({
            user: req.user!._id,
            items: []
        });
    }

    /*
     * ----------------------------------------------------
     * 7. Merge everything in memory
     * ----------------------------------------------------
     */

    for (const [variantId, quantity] of quantityMap) {
        const variant = variantMap.get(variantId)!;

        const existingItem = cart.items.find(
            cartItem =>
                cartItem.variant.toString() === variantId
        );

        if (existingItem) {
            const newQuantity =
                existingItem.quantity + quantity;

            if (newQuantity > variant.stock) {
                throw new ApiError(
                    400,
                    "Insufficient stock"
                );
            }

            existingItem.quantity = newQuantity;

            // Update price to current price
            existingItem.priceAtAddition = variant.price;
        } else {
            cart.items.push({
                product: variant.product,
                variant: variant._id,
                quantity,
                priceAtAddition: variant.price
            });
        }
    }

    /*
     * ----------------------------------------------------
     * 8. ONE database write
     * ----------------------------------------------------
     */

    await cart.save();

    /*
     * ----------------------------------------------------
     * 9. Populate cart for response
     * ----------------------------------------------------
     */

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

const previewCart = asyncHandler(async (req, res) => {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Cart items are required");
    }

    // Validate input and remove duplicate variant IDs
    const quantityMap = new Map<string, number>();

    for (const item of items) {
        const { variantId, quantity } = item;

        if (!mongoose.isValidObjectId(variantId)) {
            throw new ApiError(400, "Invalid variant ID");
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new ApiError(400, "Quantity must be at least 1");
        }

        const id = variantId.toString();

        // If the same variant appears multiple times,
        // combine the quantities.
        quantityMap.set(
            id,
            (quantityMap.get(id) || 0) + quantity
        );
    }

    const variantIds = [...quantityMap.keys()];

    // ONE database query
    const variants = await Variant.find({
        _id: { $in: variantIds }
    })
        .populate({
            path: "product",
            select: "_id name slug images"
        })
        .lean();

    // Make lookup O(1)
    const variantMap = new Map(
        variants.map(variant => [
            variant._id.toString(),
            variant
        ])
    );

    const cartItems = [];

    for (const [variantId, quantity] of quantityMap) {
        const variant = variantMap.get(variantId);

        if (!variant) {
            throw new ApiError(
                404,
                `Variant ${variantId} not found`
            );
        }

        // `populate()` supplies a product document at runtime, but Mongoose's lean type still describes this property as an ObjectId.
        const product = variant.product as unknown as {
            _id: mongoose.Types.ObjectId;
            name: string;
            slug: string;
            images: { url: string; publicId: string }[];
        } | null;

        if (!variant.isAvailable) {
            throw new ApiError(
                400,
                `${product?.name || "Product"} is unavailable`
            );
        }

        if (!product) {
            throw new ApiError(
                404,
                "Product not found for variant"
            );
        }

        if (quantity > variant.stock) {
            throw new ApiError(
                400,
                `Only ${variant.stock} items are available`
            );
        }

        cartItems.push({
            // A guest cart has no persisted cart-item ID; the variant ID is a stable identifier for its client-side quantity controls.
            _id: variant._id,
            product,

            variant: {
                _id: variant._id,
                volume: variant.volume,
                price: variant.price,
                stock: variant.stock
            },

            quantity,

            priceAtAddition: variant.price,
        });
    }

    const totalAmount = cartItems.reduce(
        (total, item) => total + (item.priceAtAddition * item.quantity),
        0
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                items: cartItems,
                totalAmount
            },
            "Cart preview generated successfully"
        )
    );
});

export {
    addItemToCart,
    getCart,
    removeCartItem,
    updateCartItem,
    clearCart,
    mergeCart,
    previewCart
}
