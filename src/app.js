import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

import authRouter from "./routes/auth.route.js";
import accountRouter from "./routes/account.route.js";
import transactionRoutes from "./routes/transaction.route.js";

app.use("/api/auth", authRouter);
app.use("/api/accounts/", accountRouter);
app.use("/api/transactions/", transactionRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
