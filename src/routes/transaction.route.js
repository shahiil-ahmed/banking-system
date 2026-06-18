import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createTransaction } from "../controllers/transaction.controller.js";
import { authSystemUserMiddleware } from "../middlewares/auth.middleware.js";
import { createInitialFundsTransaction } from "../controllers/transaction.controller.js";

const transactionRoutes = Router();

transactionRoutes.post("/", authMiddleware, createTransaction);

/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds transaction from system user
 */
transactionRoutes.post(
  "/system/initial-funds",
  authSystemUserMiddleware,
  createInitialFundsTransaction,
);

export default transactionRoutes;
