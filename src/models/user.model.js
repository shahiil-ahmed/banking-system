import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"

const userSchema = Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required for creating user account"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
      unique: [true, "Email already exist"],
    },
    name: {
      type: String,
      required: [true, "Name is required for creating an account"],
    },
    password: {
      type: String,
      required: [true, "Password is required for creating an account"],
      minlength: [6, "Password should be 6 character"],
      select: false,
    },
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function(){
    if(!this.isModified("password")) return null;

    this.password = await bcrypt.hash("this.password", 10);
})

userSchema.methods.isPasswordCorrect = async function(inputPassword){
    return await bcrypt.compare(inputPassword, this.password)
}


export default User = mongoose.model("User", userSchema);