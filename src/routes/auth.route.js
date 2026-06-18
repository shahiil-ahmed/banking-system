import { Router } from "express";
import { register } from "../controllers/auth.controller.js";
import { login } from "../controllers/auth.controller.js";

const authRouter = Router();

// register user
authRouter.post("/register", register);

// login user
authRouter.post("/login", login);

export default authRouter;
