import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import {
    createSale as createSaleService,
    getAllSales as getAllSalesService,
    getSaleById as getSaleByIdService,
} from "../services/sale.service.js";

export const createSale = asyncHandler(
    async (req: Request, res: Response) => {
        const sale = await createSaleService({
            ...req.body,
            soldBy: req.user?._id?.toString(),
        });

        return res.status(201).json(
            new ApiResponse(
                201,
                sale,
                "Sale recorded successfully"
            )
        );
    }
);

export const getAllSales = asyncHandler(
    async (req: Request, res: Response) => {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 20);

        const result = await getAllSalesService({
            page,
            limit,
            startDate: req.query.startDate as string | undefined,
            endDate: req.query.endDate as string | undefined,
            customerPhone: req.query.customerPhone as string | undefined,
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Sales retrieved successfully"
            )
        );
    }
);

export const getSaleById = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        if (typeof id !== "string") {
            throw new ApiError(400, "Invalid sale ID");
        }

        const sale = await getSaleByIdService(id);

        return res.status(200).json(
            new ApiResponse(
                200,
                sale,
                "Sale retrieved successfully"
            )
        );
    }
);
