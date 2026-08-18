import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    createAddress, 
    deleteAddress, 
    getAddressById, 
    getAddresses, 
    setDefaultAddress, 
    updateAddress 
} from "../controllers/address.controller.js";

const router = Router();

router.use(verifyJWT)

router.route("/")
    .post(createAddress)
    .get(getAddresses)

router.route("/:addressId")
    .get(getAddressById)
    .patch(updateAddress)
    .delete(deleteAddress)

router.patch("/:addressId/default", setDefaultAddress)

export default router;