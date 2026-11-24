
import { Router } from "express";

import {
    createExpense,
    getAllExpenses,
    getExpenseById,
} from "../controllers/expense.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(verifyJWT, verifyAdmin);

router.route("/")
    .post(createExpense)
    .get(getAllExpenses);

router.route("/:id")
    .get(getExpenseById);

export default router;
