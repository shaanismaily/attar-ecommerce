import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Address } from "../models/address.model.js";
import { Variant } from "../models/variant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createOrder = asyncHandler( async(req, res) => {
    const { productId } = req.params
    const { volume, quantity, addressId } = req.body

    if (!quantity || quantity < 1) {
        throw new ApiError(400, "Quantity must be at least 1");
    }

    const product = await Product.findById(productId)
    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    const address = await Address.findOne({
        _id: addressId,
        user: req.user._id 
    })
    if (!address) {
        throw new ApiError(404, "Address not found")
    }

    const variant = await Variant.findOne({ 
        product: productId,
        volume: volume
    })

    if (!variant) {
        throw new ApiError(404, "Variant does not exists")
    }

    if (!variant.isAvailable) {
        throw new ApiError(404, "Variant is not available")
    }

    if (variant.stock < quantity) {
        throw new ApiError(400, "Insufficient stock")
    }

    const total = variant.price * quantity

    const order = await Order.create({
        orderedBy: req.user._id,
        totalAmount: total,
        orderStatus: "pending",
        paymentStatus: "pending",
        shippingAddress: address._id,
        orderItems: [
            {
                product: product._id,
                variant: variant._id,
                price: variant.price,
                quantity,
                volume,
                productName: product.name
            }
        ]
    })

    if (!order) {
        throw new ApiError(500, "Something went wrong while creating order")
    }

    await Variant.findByIdAndUpdate(
        variant._id,
        {
            $inc: {
                stock: -quantity
            }
        }
    );

    const createdOrder = await Order.findById(order._id)
        .populate("shippingAddress")
        .populate("orderItems.product", "name slug images")
        .populate("orderItems.variant", "volume price stock")

    return res.status(201).json(
        new ApiResponse(201, createdOrder, "Order created successfully")
    );
})

const getUserOrders = asyncHandler( async(req, res) => {

    const orders = await Order.find( { orderedBy: req.user?._id } )
                .sort({ createdAt: -1 })
                .populate("shippingAddress")
                .populate("orderItems.product", "name slug images")
                .populate("orderItems.variant", "volume price stock")

    return res.status(200).json(new ApiResponse(
        200, orders, "Orders fetched successfully"
    ))
})

const getOrder = asyncHandler( async(req, res) => {
    const { orderId } = req.params

    const order = await Order.findById(orderId)
        .populate("shippingAddress")
        .populate("orderItems.product", "name slug images")
        .populate("orderItems.variant", "volume price stock")

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    if (order.orderedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "Unauthorized request")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            order,
            "Order fetched successfully"
        )
    )
})

const cancelOrder = asyncHandler( async(req, res) => {
    const { orderId } = req.params

    const order = await Order.findById(orderId)

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    if (order.orderedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

    if (!["pending", "packed"].includes(order.orderStatus)) {
        throw new ApiError(400, "This order can no longer be cancelled")
    }

    order.orderStatus = "cancelled"
    order.save();

    for (const item of order.orderItems) {
        await Variant.findByIdAndUpdate(
            item.variant,
            {
                $inc: {
                    stock: item.quantity
                }
            }
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200, order, "Order cancelled successfully"
        )
    )
})


// Admin controllers

const getAllOrders = asyncHandler( async(req, res) => {
    const { page=1, limit=10, query, sortType } = req.query

    const pageNumber = Math.max(1, Number(page) || 1)
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10))

    const sortOrder: 1 | -1 = sortType === "asc" ? 1 : -1
    
    const pipeline = [];

    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { "orderItems.productName": { $regex: query, $options: "i" } },
                    { "orderItems.volume": { $regex: query, $options: "i" } },
                    { orderStatus: { $regex: query, $options: "i" } },
                    { paymentStatus: { $regex: query, $options: "i" } }
                ]
            }
        });
    }

    pipeline.push(
        { $sort: { createdAt: sortOrder } },
        { $skip: (pageNumber - 1) * limitNumber },
        { $limit: limitNumber }
    );

    const orders = await Order.aggregate(pipeline);

    return res.status(200).json(
        new ApiResponse(200, orders, "Orders fetched successfully")
    )
})

const updateOrderStatus = asyncHandler( async(req, res) => {
    const { orderId } = req.params
    const { updatedStatus } = req.body

    const allowedStatuses = ["pending", "packed", "shipped", "delivered", "cancelled"];
    if (!allowedStatuses.includes(updatedStatus)) {
        throw new ApiError(400, "Invalid order status");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (["cancelled", "delivered"].includes(order.orderStatus)) {
        throw new ApiError(400, "Order status cannot be updated");
    }

    const validTransitions: Record<any, string[]> = {
        pending: ["packed", "cancelled"],
        packed: ["shipped", "cancelled"],
        shipped: ["delivered"],
    };

    if (!validTransitions[order.orderStatus]?.includes(updatedStatus)) {
        throw new ApiError(400, `Cannot change status from ${order.orderStatus} to ${updatedStatus}`);
    }

    order.orderStatus = updatedStatus
    await order.save();

    return res.status(200).json(
        new ApiResponse(200, { orderStatus: order.orderStatus }, "Order status updated successfully")
    )
})

export {
    createOrder,
    getUserOrders,
    getOrder,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
}