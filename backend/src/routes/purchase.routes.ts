
import { Router } from "express";
import { createPurchaseController } from "../controllers/purchase.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(verifyJWT, verifyAdmin);

router.post("/", createPurchaseController);

export default router;
