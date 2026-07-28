import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
    createCategory,
    deleteCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    updateImage
} from "../controllers/category.controller.js";

const router = Router();

// Anyone can view categories
router.get("/categories", getAllCategories);
router.get("/categories/:categoryId", getCategoryById);

// Only admins can modify categories
router.post("/admin/categories", verifyJWT, verifyAdmin, upload.single("image"), createCategory);
router.patch("/admin/categories/:categoryId", verifyJWT, verifyAdmin, updateCategory);
router.patch("/admin/categories/:categoryId/image", verifyJWT, verifyAdmin, upload.single("image"), updateImage);
router.delete("/admin/categories/:categoryId", verifyJWT, verifyAdmin, deleteCategory);

export default router;
