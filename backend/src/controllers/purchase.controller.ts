
import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createPurchase } from "../services/purchase.service.js";

const createPurchaseController = asyncHandler(
    async (req: Request, res: Response) => {
        const purchase = await createPurchase({
            ...req.body,
            purchasedBy: req.user?._id?.toString(),
        });

        return res.status(201).json(
            new ApiResponse(
                201,
                purchase,
                "Bulk fragrance purchase recorded successfully"
            )
        );
    }
);

export { createPurchaseController };
