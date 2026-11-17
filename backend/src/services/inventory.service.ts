
import mongoose, { Types } from "mongoose";
import { Variant } from "../models/variant.model.js";
import StockMovement from "../models/stockMovement.model.js";

type StockReferenceType = "PURCHASE" | "ORDER" | "SALE" | "MANUAL";

type StockMovementType =
    | "PURCHASE"
    | "POS_SALE"
    | "ONLINE_ORDER"
    | "ORDER_CANCELLATION"
    | "CUSTOMER_RETURN"
    | "DAMAGE"
    | "ADJUSTMENT";

interface MovementOptions {
    variantId: string;
    quantity: number;
    movementType: StockMovementType;
    direction: "IN" | "OUT";
    referenceType?: StockReferenceType;
    referenceId?: string;
    performedBy?: string;
    note?: string;
}

const validateQuantity = (quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Quantity must be a positive integer");
    }
};

const applyMovement = async (options: MovementOptions) => {
    const {
        variantId,
        quantity,
        movementType,
        direction,
        referenceType,
        referenceId,
        performedBy,
        note,
    } = options;

    validateQuantity(quantity);

    if (!Types.ObjectId.isValid(variantId)) {
        throw new Error("Invalid variant ID");
    }

    if (referenceId && !Types.ObjectId.isValid(referenceId)) {
        throw new Error("Invalid reference ID");
    }

    if (performedBy && !Types.ObjectId.isValid(performedBy)) {
        throw new Error("Invalid user ID");
    }

    const session = await mongoose.startSession();

    let result: {
        variantId: Types.ObjectId;
        stockBefore: number;
        stockAfter: number;
    } | null = null;

    try {
        await session.withTransaction(async () => {
            const variant = await Variant.findById(variantId).session(session);

            if (!variant) {
                throw new Error("Variant not found");
            }

            if (
                (movementType === "POS_SALE" ||
                    movementType === "ONLINE_ORDER") &&
                !variant.isAvailable
            ) {
                throw new Error("This variant is not available for sale");
            }

            const stockBefore = variant.stock;

            const stockAfter =
                direction === "IN"
                    ? stockBefore + quantity
                    : stockBefore - quantity;

            if (stockAfter < 0) {
                throw new Error("Insufficient stock");
            }

            // Conditional update protects against stale stock values.
            const updateResult = await Variant.updateOne(
                {
                    _id: variant._id,
                    stock: stockBefore,
                },
                {
                    $inc: {
                        stock: direction === "IN" ? quantity : -quantity,
                    },
                },
                { session }
            );

            if (updateResult.modifiedCount !== 1) {
                throw new Error("Stock changed concurrently. Please retry.");
            }

            await StockMovement.create(
                [
                    {
                        product: variant.product,
                        variant: variant._id,
                        movementType,
                        direction,
                        quantity,
                        stockBefore,
                        stockAfter,
                        referenceType,
                        referenceId: referenceId
                            ? new Types.ObjectId(referenceId)
                            : undefined,
                        performedBy: performedBy
                            ? new Types.ObjectId(performedBy)
                            : undefined,
                        note,
                    },
                ],
                { session }
            );

            result = {
                variantId: variant._id,
                stockBefore,
                stockAfter,
            };
        });

        if (!result) {
            throw new Error("Stock movement could not be completed");
        }

        return result;
    } finally {
        await session.endSession();
    }
};

const addStock = async (
    options: Omit<MovementOptions, "direction"> & {
        direction?: never;
    }
) => {
    const allowedTypes: StockMovementType[] = [
        "PURCHASE",
        "ORDER_CANCELLATION",
        "CUSTOMER_RETURN",
        "ADJUSTMENT",
    ];

    if (!allowedTypes.includes(options.movementType)) {
        throw new Error("Invalid stock-in movement type");
    }

    return applyMovement({
        ...options,
        direction: "IN",
    });
};

const removeStock = async (
    options: Omit<MovementOptions, "direction"> & {
        direction?: never;
    }
) => {
    const allowedTypes: StockMovementType[] = [
        "POS_SALE",
        "ONLINE_ORDER",
        "DAMAGE",
        "ADJUSTMENT",
    ];

    if (!allowedTypes.includes(options.movementType)) {
        throw new Error("Invalid stock-out movement type");
    }

    return applyMovement({
        ...options,
        direction: "OUT",
    });
};

const adjustStock = async ({
    variantId,
    newStock,
    performedBy,
    note,
}: {
    variantId: string;
    newStock: number;
    performedBy?: string;
    note?: string;
}) => {
    if (!Number.isInteger(newStock) || newStock < 0) {
        throw new Error("New stock must be a non-negative integer");
    }

    if (!Types.ObjectId.isValid(variantId)) {
        throw new Error("Invalid variant ID");
    }

    if (performedBy && !Types.ObjectId.isValid(performedBy)) {
        throw new Error("Invalid user ID");
    }

    const session = await mongoose.startSession();

    let result: {
        variantId: Types.ObjectId;
        stockBefore: number;
        stockAfter: number;
    } | null = null;

    try {
        await session.withTransaction(async () => {
            const variant = await Variant.findById(variantId).session(session);

            if (!variant) {
                throw new Error("Variant not found");
            }

            const stockBefore = variant.stock;
            const difference = newStock - stockBefore;

            if (difference === 0) {
                result = {
                    variantId: variant._id,
                    stockBefore,
                    stockAfter: stockBefore,
                };
                return;
            }

            const direction = difference > 0 ? "IN" : "OUT";
            const quantity = Math.abs(difference);

            const updateResult = await Variant.updateOne(
                {
                    _id: variant._id,
                    stock: stockBefore,
                },
                {
                    $set: {
                        stock: newStock,
                    },
                },
                { session }
            );

            if (updateResult.modifiedCount !== 1) {
                throw new Error("Stock changed concurrently. Please retry.");
            }

            await StockMovement.create(
                [
                    {
                        product: variant.product,
                        variant: variant._id,
                        movementType: "ADJUSTMENT",
                        direction,
                        quantity,
                        stockBefore,
                        stockAfter: newStock,
                        referenceType: "MANUAL",
                        performedBy: performedBy
                            ? new Types.ObjectId(performedBy)
                            : undefined,
                        note,
                    },
                ],
                { session }
            );

            result = {
                variantId: variant._id,
                stockBefore,
                stockAfter: newStock,
            };
        });

        if (!result) {
            throw new Error("Stock adjustment could not be completed");
        }

        return result;
    } finally {
        await session.endSession();
    }
};

const inventoryService = {
    addStock,
    removeStock,
    adjustStock,
};

export default inventoryService;
