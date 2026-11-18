
import mongoose, { Types, type ClientSession } from "mongoose";
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

interface StockResult {
    variantId: Types.ObjectId;
    stockBefore: number;
    stockAfter: number;
}

const validateQuantity = (quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Quantity must be a positive integer");
    }
};

const runInTransaction = async <T>(
    existingSession: ClientSession | undefined,
    operation: (session: ClientSession) => Promise<T>
): Promise<T> => {
    if (existingSession) {
        return operation(existingSession);
    }

    const session = await mongoose.startSession();

    try {
        let result!: T;

        await session.withTransaction(async () => {
            result = await operation(session);
        });

        return result;
    } finally {
        await session.endSession();
    }
};

const applyMovement = async (
    options: MovementOptions,
    existingSession?: ClientSession
): Promise<StockResult> => {
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

    return runInTransaction(existingSession, async (session) => {
        const variant = await Variant.findById(variantId).session(session);

        if (!variant) {
            throw new Error("Variant not found");
        }

        const isSale =
            movementType === "POS_SALE" ||
            movementType === "ONLINE_ORDER";

        if (isSale && !variant.isAvailable) {
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

        const updateResult = await Variant.updateOne(
            {
                _id: variant._id,
                stock: stockBefore,
                ...(isSale ? { isAvailable: true } : {}),
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

        return {
            variantId: variant._id,
            stockBefore,
            stockAfter,
        };
    });
};

const addStock = async (
    options: Omit<MovementOptions, "direction">,
    session?: ClientSession
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

    return applyMovement(
        { ...options, direction: "IN" },
        session
    );
};

const removeStock = async (
    options: Omit<MovementOptions, "direction">,
    session?: ClientSession
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

    return applyMovement(
        { ...options, direction: "OUT" },
        session
    );
};

const adjustStock = async (
    {
        variantId,
        newStock,
        performedBy,
        note,
    }: {
        variantId: string;
        newStock: number;
        performedBy?: string;
        note?: string;
    },
    existingSession?: ClientSession
): Promise<StockResult> => {
    if (!Number.isInteger(newStock) || newStock < 0) {
        throw new Error("New stock must be a non-negative integer");
    }

    if (!Types.ObjectId.isValid(variantId)) {
        throw new Error("Invalid variant ID");
    }

    if (performedBy && !Types.ObjectId.isValid(performedBy)) {
        throw new Error("Invalid user ID");
    }

    return runInTransaction(existingSession, async (session) => {
        const variant = await Variant.findById(variantId).session(session);

        if (!variant) {
            throw new Error("Variant not found");
        }

        const stockBefore = variant.stock;
        const difference = newStock - stockBefore;

        if (difference === 0) {
            return {
                variantId: variant._id,
                stockBefore,
                stockAfter: stockBefore,
            };
        }

        const direction = difference > 0 ? "IN" : "OUT";
        const quantity = Math.abs(difference);

        const updateResult = await Variant.updateOne(
            {
                _id: variant._id,
                stock: stockBefore,
            },
            {
                $set: { stock: newStock },
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

        return {
            variantId: variant._id,
            stockBefore,
            stockAfter: newStock,
        };
    });
};

const inventoryService = {
    addStock,
    removeStock,
    adjustStock,
};

export default inventoryService;
