import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Variant } from "../models/variant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

    const { productId } = req.params
    const { quantity, volume } = req.body

    if (!quantity || quantity < 1) {
        throw new ApiError(400, "Quantity must be at least 1");
    }
    
    const variant = await Variant.findOne({ product: productId, volume: volume })
    if (!variant) {
        throw new ApiError(404, "Variant not found")
    }
    
    if (!variant.product.equals(productId)) {
        throw new ApiError(404, "Product not found")
    }

    if (!variant.isAvailable) {
        throw new ApiError(404, "Variant is not available")
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
                    product: productId,
                    variant: variant._id,
                    quantity,
                    priceAtAddition: variant.price
                }
            ]
        })
        
        return res.status(201).json(
            new ApiResponse(201, cart, "User cart created successfully")
        )
    }

    const existedItem = userCart.items.find(item => 
        item.product.equals(productId) &&
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
            product: productId,
            variant: variant._id,
            quantity,
            priceAtAddition: variant.price
            })
    }

    await userCart.save();
    await userCart.populate("items.product");
    await userCart.populate("items.variant");

    return res.status(200).json(
        new ApiResponse(200, userCart, "User cart updated successfully")
    )
})