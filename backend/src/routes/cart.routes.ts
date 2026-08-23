import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addItemToCart, 
    getCart,
    removeCartItem,
    updateCartItem,
    clearCart,
    mergeCart,
    previewCart
} from "../controllers/cart.controller.js";


const router = Router()

router.post("/preview", previewCart)
router.use(verifyJWT)

router
    .route("/")
    .get(getCart)
    .delete(clearCart)

router.post("/items/:variantId", addItemToCart)

router.post("/merge", mergeCart)

router
    .route("/items/:cartItemId")
    .patch(updateCartItem)
    .delete(removeCartItem)

export default router;