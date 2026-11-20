
import { Router } from "express";
import {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deactivateSupplier,
} from "../controllers/supplier.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(verifyJWT, verifyAdmin);

router.route("/")
    .post(createSupplier)
    .get(getAllSuppliers);

router.route("/:id")
    .get(getSupplierById)
    .patch(updateSupplier)
    .delete(deactivateSupplier);

export default router;
