
import type { Request, Response } from "express";
import { Supplier } from "../models/supplier.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const createSupplier = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            name,
            contactPerson,
            phone,
            email,
            address,
            notes,
        } = req.body;

        if (
            !name ||
            typeof name !== "string" ||
            !phone ||
            typeof phone !== "string"
        ) {
            throw new ApiError(400, "Supplier name and phone are required");
        }

        const supplier = await Supplier.create({
            name,
            contactPerson,
            phone,
            email,
            address,
            notes,
        });

        return res.status(201).json(
            new ApiResponse(
                201,
                supplier,
                "Supplier created successfully"
            )
        );
    }
);

const getAllSuppliers = asyncHandler(
    async (_req: Request, res: Response) => {
        const suppliers = await Supplier.find()
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(
                200,
                suppliers,
                "Suppliers fetched successfully"
            )
        );
    }
);

const getSupplierById = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
            throw new ApiError(400, "Invalid supplier ID");
        }

        const supplier = await Supplier.findById(id);

        if (!supplier) {
            throw new ApiError(404, "Supplier not found");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                supplier,
                "Supplier fetched successfully"
            )
        );
    }
);

const updateSupplier = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
            throw new ApiError(400, "Invalid supplier ID");
        }

        const allowedFields = [
            "name",
            "contactPerson",
            "phone",
            "email",
            "address",
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

        const supplier = await Supplier.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!supplier) {
            throw new ApiError(404, "Supplier not found");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                supplier,
                "Supplier updated successfully"
            )
        );
    }
);

const deactivateSupplier = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
            throw new ApiError(400, "Invalid supplier ID");
        }

        const supplier = await Supplier.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true }
        );

        if (!supplier) {
            throw new ApiError(404, "Supplier not found");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                supplier,
                "Supplier deactivated successfully"
            )
        );
    }
);

export {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deactivateSupplier,
};
