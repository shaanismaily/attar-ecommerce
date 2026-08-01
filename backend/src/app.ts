import express, { type ErrorRequestHandler } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.routes.js"
import productRouter from "./routes/product.routes.js"
import categoryRouter from "./routes/category.routes.js"
import orderRouter from "./routes/order.routes.js"
import cartRouter from "./routes/cart.routes.js"


app.use("/api/v1/users", userRouter)
app.use("/api/v1", productRouter)
app.use("/api/v1", categoryRouter)
app.use("/api/v1", orderRouter)
app.use("/api/v1/cart", cartRouter)

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    errors: err.errors || [],
  });
};

app.use(errorHandler);

export { app };
