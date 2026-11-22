import { Router } from "express";

import {
    createSale,
    getAllSales,
    getSaleById,
} from "../controllers/sale.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(verifyJWT, verifyAdmin);

router.route("/")
    .post(createSale)
    .get(getAllSales);

router.route("/:id")
    .get(getSaleById);

export default router;