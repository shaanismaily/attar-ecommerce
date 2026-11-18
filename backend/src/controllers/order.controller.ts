import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Address } from "../models/address.model.js";
import { Variant } from "../models/variant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { Types } from "mongoose";
import inventoryService from "../services/inventory.service.js";

const createOrder = asyncHandler(async (req, res) => {
  const { items, addressId } = req.body;

  if (!addressId || !Types.ObjectId.isValid(addressId)) {
    throw new ApiError(400, "A valid address is required");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Order must contain at least one item");
  }

  const session = await mongoose.startSession();
  let createdOrderId: Types.ObjectId | null = null;

  try {
    await session.withTransaction(async () => {
      const address = await Address.findOne({
        _id: addressId,
        user: req.user._id,
      }).session(session);

      if (!address) {
        throw new ApiError(404, "Address not found");
      }

      const addressTypes = ["home", "work", "other"] as const;

      if (
        !addressTypes.includes(
          address.addressType as (typeof addressTypes)[number]
        )
      ) {
        throw new ApiError(400, "Invalid address type");
      }

      const orderItems = [];
      const stockRequirements = new Map<
        string,
        { variantId: string; quantity: number }
      >();

      let totalAmount = 0;

      for (const item of items) {
        const { productId, variantId, quantity } = item;

        if (
          !Types.ObjectId.isValid(productId) ||
          !Types.ObjectId.isValid(variantId)
        ) {
          throw new ApiError(400, "Invalid product or variant ID");
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new ApiError(400, "Quantity must be a positive integer");
        }

        const product = await Product.findById(productId).session(session);

        if (!product) {
          throw new ApiError(404, "Product not found");
        }

        const variant = await Variant.findOne({
          _id: variantId,
          product: product._id,
        }).session(session);

        if (!variant) {
          throw new ApiError(404, "Variant does not exist");
        }

        if (!variant.isAvailable) {
          throw new ApiError(400, `${product.name} is not available`);
        }

        if (variant.stock < quantity) {
          throw new ApiError(400, `Insufficient stock for ${product.name}`);
        }

        const subtotal = variant.price * quantity;
        totalAmount += subtotal;

        orderItems.push({
          product: product._id,
          variant: variant._id,
          productName: product.name,
          volume: variant.volume,
          price: variant.price,
          quantity,
        });

        const key = variant._id.toString();
        const existing = stockRequirements.get(key);

        if (existing) {
          existing.quantity += quantity;
        } else {
          stockRequirements.set(key, {
            variantId: key,
            quantity,
          });
        }
      }

      const [order] = await Order.create(
        [
          {
            orderedBy: req.user._id,
            totalAmount,
            orderStatus: "pending",
            paymentStatus: "pending",
            shippingAddressSnapshot: {
              firstName: address.firstName,
              lastName: address.lastName,
              phone: address.phone,
              street: address.street,
              landmark: address.landmark,
              city: address.city,
              state: address.state,
              country: address.country,
              zipCode: address.zipCode,
              addressType: address.addressType as (typeof addressTypes)[number],
            },
            orderItems,
          },
        ],
        { session }
      );

      for (const requirement of stockRequirements.values()) {
        await inventoryService.removeStock(
          {
            variantId: requirement.variantId,
            quantity: requirement.quantity,
            movementType: "ONLINE_ORDER",
            referenceType: "ORDER",
            referenceId: order._id.toString(),
            performedBy: req.user._id.toString(),
            note: "Stock deducted for online order",
          },
          session
        );
      }

      createdOrderId = order._id;
    });
  } finally {
    await session.endSession();
  }

  if (!createdOrderId) {
    throw new ApiError(500, "Order creation failed");
  }

  const createdOrder = await Order.findById(createdOrderId)
    .populate("orderItems.product", "name slug images")
    .populate("orderItems.variant", "volume price stock");

  return res
    .status(201)
    .json(new ApiResponse(201, createdOrder, "Order created successfully"));
});

const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ orderedBy: req.user?._id })
    .sort({ createdAt: -1 })
    .populate("orderItems.product", "name slug images")
    .populate("orderItems.variant", "volume price stock");

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const getOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate("orderItems.product", "name slug images")
    .populate("orderItems.variant", "volume price stock");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.orderedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(401, "Unauthorized request");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

const cancelOrderAndRestoreStock = async (
  orderId: string,
  performedBy: string,
  orderedBy?: string
) => {
  if (!Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const filter: Record<string, any> = {
        _id: orderId,
        orderStatus: { $in: ["pending", "packed"] },
      };

      if (orderedBy) {
        filter.orderedBy = orderedBy;
      }

      const order = await Order.findOneAndUpdate(
        filter,
        { $set: { orderStatus: "cancelled" } },
        { new: true, session }
      );

      if (!order) {
        const existingOrder = await Order.findById(orderId).session(session);

        if (!existingOrder) {
          throw new ApiError(404, "Order not found");
        }

        if (orderedBy && existingOrder.orderedBy.toString() !== orderedBy) {
          throw new ApiError(403, "Unauthorized request");
        }

        throw new ApiError(
          400,
          "Order cannot be cancelled in its current status"
        );
      }

      for (const item of order.orderItems) {
        await inventoryService.addStock(
          {
            variantId: item.variant.toString(),
            quantity: item.quantity,
            movementType: "ORDER_CANCELLATION",
            referenceType: "ORDER",
            referenceId: order._id.toString(),
            performedBy,
            note: "Stock restored after order cancellation",
          },
          session
        );
      }
    });
  } finally {
    await session.endSession();
  }
};

const getOrderIdParam = (orderId: string | string[]) => {
  if (Array.isArray(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  return orderId;
};

const cancelOrder = asyncHandler(async (req, res) => {
    const orderId = getOrderIdParam(req.params.orderId);

    await cancelOrderAndRestoreStock(
        orderId,
        req.user._id.toString(),
        req.user._id.toString()
    );

    return res.status(200).json(
        new ApiResponse(200, null, "Order cancelled successfully")
    );
});


// Admin controllers

const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortType } = req.query;

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));

  const sortOrder: 1 | -1 = sortType === "asc" ? 1 : -1;

  const pipeline = [];

  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { "orderItems.productName": { $regex: query, $options: "i" } },
          { "orderItems.volume": { $regex: query, $options: "i" } },
          { orderStatus: { $regex: query, $options: "i" } },
          { paymentStatus: { $regex: query, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push(
    { $sort: { createdAt: sortOrder } },
    { $skip: (pageNumber - 1) * limitNumber },
    { $limit: limitNumber }
  );

  const orders = await Order.aggregate(pipeline);

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const orderId = getOrderIdParam(req.params.orderId);
    const { updatedStatus } = req.body;

    const allowedStatuses = [
        "pending",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
    ];

    if (!allowedStatuses.includes(updatedStatus)) {
        throw new ApiError(400, "Invalid order status");
    }

    if (updatedStatus === "cancelled") {
        await cancelOrderAndRestoreStock(
            orderId,
            req.user._id.toString()
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                { orderStatus: "cancelled" },
                "Order cancelled successfully"
            )
        );
    }

    const order = await Order.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const validTransitions: Record<string, string[]> = {
        pending: ["packed"],
        packed: ["shipped"],
        shipped: ["delivered"],
    };

    if (!validTransitions[order.orderStatus]?.includes(updatedStatus)) {
        throw new ApiError(
            400,
            `Cannot change status from ${order.orderStatus} to ${updatedStatus}`
        );
    }

    order.orderStatus = updatedStatus;
    await order.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { orderStatus: order.orderStatus },
            "Order status updated successfully"
        )
    );
});

export {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
