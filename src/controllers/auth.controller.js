import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { sendRegistrationEmail } from "../services/email.service.js";
import { tokenBlackListModel } from "../models/blackList.model.js";

/**
 * - user register controller
 * - POST/api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new ApiError(400, "All fields are required");
  }

  const isExist = await User.findOne({ email });

  if (isExist) {
    throw new ApiError(422, "User already exists with this email");
  }

  const user = await User.create({
    email,
    password,
    name,
  });

  const createdUser = await User.findById(user._id).select("-password");

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  // Send registration welcome email
  await sendRegistrationEmail(user.email, user.name);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        createdUser,
        token,
      },
      "User created successfully",
    ),
  );
});

/**
 * - user login controller
 * - POST/api/auth/login
 */

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Email or passowrd is invalid");
  }

  const isValidPassword = await user.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(401, "Email or passowrd is invalid");
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        token,
      },
      "User logged in successfully",
    ),
  );
});

export const userLogoutController = asyncHandler(async (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "User logged out successfully"));
  }

  await tokenBlackListModel.create({
    token,
  });

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});
