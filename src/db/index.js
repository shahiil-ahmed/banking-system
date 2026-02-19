import mongoose from "mongoose";
import DB_NAME from "../constants.js";

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connected!!! HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`MongoDB connection failed: ${error.message}`)
        process.exit(1);
    }
}

export {connectDB};