import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { createOrder,
    getUserOrders,
    getOrder,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
} from "../controllers/order.controller.js";


const router = Router()

router.use(verifyJWT)


router.post("/orders", createOrder);
router.get("/orders/user", getUserOrders);
router.get("/orders/:orderId", getOrder);
router.put("/orders/:orderId/cancel", cancelOrder);

// Admin routes
router.get("/admin/orders", verifyAdmin, getAllOrders)
router.patch("/admin/orders/:orderId/status", verifyAdmin, updateOrderStatus)

export default router;