
import { Router } from "express";
import {
    createRawMaterial,
    getAllRawMaterials,
    getRawMaterialById,
    updateRawMaterial,
    deactivateRawMaterial,
} from "../controllers/rawMaterial.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(verifyJWT, verifyAdmin);

router.route("/")
    .post(createRawMaterial)
    .get(getAllRawMaterials);

router.route("/:id")
    .get(getRawMaterialById)
    .patch(updateRawMaterial)
    .delete(deactivateRawMaterial);

export default router;
