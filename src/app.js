import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

import authRouter from "./routes/auth.route.js";
import accountRouter from "./routes/account.route.js";

app.use("/api/auth", authRouter);
app.use("/api/accounts/", accountRouter);

export default app;
