import express, { type ErrorRequestHandler } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./db/index.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

import userRouter from "./routes/user.routes.js"
import productRouter from "./routes/product.routes.js"
import categoryRouter from "./routes/category.routes.js"
import orderRouter from "./routes/order.routes.js"
import cartRouter from "./routes/cart.routes.js"
import variantRouter from "./routes/variant.routes.js"
import healthcheckRouter from "./routes/healthcheck.route.js"
import addressRouter from "./routes/address.routes.js"
import purchaseRouter from "./routes/purchase.routes.js";
import productionRouter from "./routes/production.routes.js";
import rawMaterialRouter from "./routes/rawMaterial.routes.js"
import supplierRouter from "./routes/supplier.routes.js"
import saleRouter from "./routes/sale.routes.js";

app.use("/api/v1", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1", productRouter)
app.use("/api/v1", categoryRouter)
app.use("/api/v1", orderRouter)
app.use("/api/v1/cart", cartRouter)
app.use("/api/v1", variantRouter)
app.use("/api/v1/address", addressRouter)
app.use("/api/v1/purchases", purchaseRouter);
app.use("/api/v1/production", productionRouter);
app.use("/api/v1/raw-materials", rawMaterialRouter);
app.use("/api/v1/suppliers", supplierRouter);
app.use("/api/v1/sales", saleRouter)

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isValidationError = err?.name === "ValidationError";
  const isDuplicateKeyError = err?.code === 11000;
  const statusCode = isValidationError
    ? 400
    : isDuplicateKeyError
      ? 409
      : err.statusCode || 500;

  const message = isValidationError
    ? "Validation failed"
    : isDuplicateKeyError
      ? "A record with this value already exists"
      : err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
  });
};

app.use(errorHandler);

export default app;
