import { Router } from "express";
import {
  register,
  login,
  userLogoutController,
} from "../controllers/auth.controller.js";

const authRouter = Router();

// register user
authRouter.post("/register", register);

// login user
authRouter.post("/login", login);

/**
 * - POST /api/auth/logout
 */
authRouter.post("/logout", userLogoutController);

export default authRouter;
