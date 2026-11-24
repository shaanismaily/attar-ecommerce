import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import {
  createExpense as createExpenseService,
  getAllExpenses as getAllExpensesService,
  getExpenseById as getExpenseByIdService,
} from "../services/expense.service.js";

export const createExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await createExpenseService({
      ...req.body,
      recordedBy: req.user?._id?.toString(),
    });

    return res
      .status(201)
      .json(new ApiResponse(201, expense, "Expense recorded successfully"));
  }
);

export const getAllExpenses = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getAllExpensesService({
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
      category: req.query.category as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Expenses retrieved successfully"));
  }
);

export const getExpenseById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
      throw new ApiError(400, "Invalid expense ID");
    }
    const expense = await getExpenseByIdService(id);

    return res
      .status(200)
      .json(new ApiResponse(200, expense, "Expense retrieved successfully"));
  }
);
