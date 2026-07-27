import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addItemToCart, 
    getCart,
    removeCartItem,
    updateCartItem,
    clearCart
} from "../controllers/cart.controller.js";


const router = Router()

router.use(verifyJWT)

router
    .route("/")
    .post(getCart)
    .delete(clearCart)

router.route("/items").post(addItemToCart)

router
    .route("/items/:cartItemId")
    .patch(updateCartItem)
    .delete(removeCartItem)

export default router;