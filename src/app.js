import express from "express"

const app = express();

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))



import authRouter from "./routes/auth.route.js";
app.use("/api/auth", authRouter);
export default app;