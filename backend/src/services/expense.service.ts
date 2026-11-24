
import { Types } from "mongoose";
import { Expense, expenseCategories, expensePaymentMethods } from "../models/expense.model.js";
import { ApiError } from "../utils/ApiError.js";

interface CreateExpenseInput {
    category: string;
    description: string;
    amount: number;
    paymentMethod: string;
    expenseDate?: string;
    vendorName?: string;
    referenceNumber?: string;
    notes?: string;
    recordedBy: string;
}

export const createExpense = async (input: CreateExpenseInput) => {
    if (!Types.ObjectId.isValid(input.recordedBy)) {
        throw new ApiError(400, "Invalid user ID");
    }

    if (!expenseCategories.includes(input.category as any)) {
        throw new ApiError(400, "Invalid expense category");
    }

    if (!expensePaymentMethods.includes(input.paymentMethod as any)) {
        throw new ApiError(400, "Invalid payment method");
    }

    if (
        typeof input.amount !== "number" ||
        !Number.isFinite(input.amount) ||
        input.amount <= 0 ||
        Math.round(input.amount * 100) !== input.amount * 100
    ) {
        throw new ApiError(400, "Invalid expense amount");
    }

    if (
        typeof input.description !== "string" ||
        !input.description.trim()
    ) {
        throw new ApiError(400, "Expense description is required");
    }

    const expenseDate = input.expenseDate
        ? new Date(input.expenseDate)
        : new Date();

    if (Number.isNaN(expenseDate.getTime())) {
        throw new ApiError(400, "Invalid expense date");
    }

    return Expense.create({
        category: input.category,
        description: input.description.trim(),
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        expenseDate,
        vendorName: input.vendorName?.trim(),
        referenceNumber: input.referenceNumber?.trim(),
        notes: input.notes?.trim(),
        recordedBy: new Types.ObjectId(input.recordedBy),
    });
};

export const getAllExpenses = async ({
    page = 1,
    limit = 20,
    category,
    startDate,
    endDate,
}: {
    page?: number;
    limit?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
}) => {
    if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
    ) {
        throw new ApiError(400, "Invalid pagination values");
    }

    const filter: Record<string, any> = {};

    if (category) {
        if (!expenseCategories.includes(category as any)) {
            throw new ApiError(400, "Invalid expense category");
        }
        filter.category = category;
    }

    if (startDate || endDate) {
        filter.expenseDate = {};

        if (startDate) {
            const start = new Date(startDate);
            if (Number.isNaN(start.getTime())) {
                throw new ApiError(400, "Invalid start date");
            }
            filter.expenseDate.$gte = start;
        }

        if (endDate) {
            const end = new Date(endDate);
            if (Number.isNaN(end.getTime())) {
                throw new ApiError(400, "Invalid end date");
            }
            filter.expenseDate.$lte = end;
        }

        if (
            startDate &&
            endDate &&
            new Date(startDate) > new Date(endDate)
        ) {
            throw new ApiError(400, "Start date cannot be after end date");
        }
    }

    const skip = (page - 1) * limit;

    const [expenses, totalExpenses, totals] = await Promise.all([
        Expense.find(filter)
            .sort({ expenseDate: -1 })
            .skip(skip)
            .limit(limit)
            .populate("recordedBy", "name email")
            .lean(),

        Expense.countDocuments(filter),

        Expense.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                },
            },
        ]),
    ]);

    return {
        expenses,
        summary: {
            totalAmount: totals[0]?.totalAmount ?? 0,
            totalExpenses,
        },
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalExpenses / limit),
            totalExpenses,
            limit,
        },
    };
};

export const getExpenseById = async (expenseId: string) => {
    if (!Types.ObjectId.isValid(expenseId)) {
        throw new ApiError(400, "Invalid expense ID");
    }

    const expense = await Expense.findById(expenseId)
        .populate("recordedBy", "name email");

    if (!expense) {
        throw new ApiError(404, "Expense not found");
    }

    return expense;
};
