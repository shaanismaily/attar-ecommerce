
import { Router } from "express";
import { createProductionController } from "../controllers/production.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(verifyJWT, verifyAdmin);

router.post("/", createProductionController);

export default router;
