
import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createProductionBatch } from "../services/production.service.js";

const createProductionController = asyncHandler(
    async (req: Request, res: Response) => {
        const batch = await createProductionBatch({
            ...req.body,
            producedBy: req.user?._id?.toString(),
        });

        return res.status(201).json(
            new ApiResponse(
                201,
                batch,
                "Bottling batch completed successfully"
            )
        );
    }
);

export { createProductionController };