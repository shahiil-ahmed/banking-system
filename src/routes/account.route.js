import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createAccountController } from "../controllers/account.controller.js";

const accountRouter = express.Router();

/**
 * -POST/api/accounts
 * -CREATE A NEW ACCOUNT
 * - PROTECTED ROUTE
 */

accountRouter.post("/", authMiddleware, createAccountController);

export default accountRouter;
