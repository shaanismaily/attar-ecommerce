import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAddress, deleteAddress, getAddresses } from "../controllers/address.controller.js";

const router = Router();

router.use(verifyJWT)

router
    .post("/", createAddress)
    .get("/", getAddresses)

router.delete("/:addressId", deleteAddress)

export default router;