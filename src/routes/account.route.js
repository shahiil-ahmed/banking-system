import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController,
} from "../controllers/account.controller.js";

const accountRouter = express.Router();

/**
 * -POST/api/accounts
 * -CREATE A NEW ACCOUNT
 * - PROTECTED ROUTE
 */

accountRouter.post("/", authMiddleware, createAccountController);

/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user
 * - Protected Route
 */
accountRouter.get("/", authMiddleware, getUserAccountsController);

/**
 * - GET /api/accounts/balance/:accountId
 */
accountRouter.get(
  "/balance/:accountId",
  authMiddleware,
  getAccountBalanceController,
);

export default accountRouter;
