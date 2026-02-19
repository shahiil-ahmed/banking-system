import dotenv from "dotenv"
import app from "./app.js";
import { connectDB } from "./db/index.js";
dotenv.config()
const PORT = process.env.PORT
connectDB()
.then(()=>{
    app.listen(PORT, ()=> {
        console.log(`App is running on the port: ${PORT}`)
    })
})
.catch((err)=>{
    console.log(`Connection error: ${err.message}`)
})