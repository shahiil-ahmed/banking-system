import { Router } from "express";
import { register } from "../controllers/auth.controller.js";
import { login } from "../controllers/auth.controller.js";

const router = Router();

// register user
router.post("/register", register);

// login user
router.post("/login", login);
export default router;