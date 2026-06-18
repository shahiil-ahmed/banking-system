import User from "../models/user.model.js";
// import TokenBlackList from "../models/blackList.model.js";
import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Unauthorized access, token is missing");
  }

  // const isBlacklisted = await TokenBlackList.findOne({ token });

  // if (isBlacklisted) {
  //   throw new ApiError(401, "Unauthorized access, token is invalid");
  // }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  req.user = user;

  next();
});

export const authSystemUserMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Unauthorized access, token is missing");
  }

  // const isBlacklisted = await TokenBlackList.findOne({ token });

  // if (isBlacklisted) {
  //   throw new ApiError(401, "Unauthorized access, token is invalid");
  // }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.userId).select("+systemUser");

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (!user.systemUser) {
    throw new ApiError(403, "Forbidden access, not a system user");
  }

  req.user = user;

  next();
});
