
import type { Request, Response } from "express";
import { RawMaterial } from "../models/rawMaterial.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const createRawMaterial = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            name,
            sku,
            densityGramsPerMl,
            minimumStockGrams,
            notes,
        } = req.body;

        if (
            !name ||
            typeof name !== "string" ||
            !Number.isFinite(densityGramsPerMl) ||
            densityGramsPerMl <= 0
        ) {
            throw new ApiError(400, "Invalid raw material data");
        }

        const rawMaterial = await RawMaterial.create({
            name,
            sku,
            densityGramsPerMl,
            minimumStockGrams: minimumStockGrams ?? 0,
            notes,
        });

        return res.status(201).json(
            new ApiResponse(
                201,
                rawMaterial,
                "Raw material created successfully"
            )
        );
    }
);

const getAllRawMaterials = asyncHandler(
    async (_req: Request, res: Response) => {
        const rawMaterials = await RawMaterial.find()
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(
                200,
                rawMaterials,
                "Raw materials fetched successfully"
            )
        );
    }
);

const getRawMaterialById = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
            throw new ApiError(400, "Invalid raw material ID");
        }

        const rawMaterial = await RawMaterial.findById(id);

        if (!rawMaterial) {
            throw new ApiError(404, "Raw material not found");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                rawMaterial,
                "Raw material fetched successfully"
            )
        );
    }
);

const updateRawMaterial = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
            throw new ApiError(400, "Invalid raw material ID");
        }

        const allowedFields = [
            "name",
            "sku",
            "densityGramsPerMl",
            "minimumStockGrams",
            "notes",
            "isActive",
        ];

        const updates: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            throw new ApiError(400, "No valid fields provided");
        }

        const rawMaterial = await RawMaterial.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!rawMaterial) {
            throw new ApiError(404, "Raw material not found");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                rawMaterial,
                "Raw material updated successfully"
            )
        );
    }
);

const deactivateRawMaterial = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
            throw new ApiError(400, "Invalid raw material ID");
        }

        const rawMaterial = await RawMaterial.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true }
        );

        if (!rawMaterial) {
            throw new ApiError(404, "Raw material not found");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                rawMaterial,
                "Raw material deactivated successfully"
            )
        );
    }
);

export {
    createRawMaterial,
    getAllRawMaterials,
    getRawMaterialById,
    updateRawMaterial,
    deactivateRawMaterial,
};
