import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createVariant,
  getVariants,
  updateVariant,
} from "../controllers/variant.controller.js";

const router = Router();

router.route("/admin/variants").post(verifyJWT, verifyAdmin, createVariant);

router.patch(
  "/admin/variants/:variantId",
  verifyJWT,
  verifyAdmin,
  updateVariant
);

router.get("/products/:productId/variants", getVariants);

export default router;
