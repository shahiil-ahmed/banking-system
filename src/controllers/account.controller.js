import { accountModel } from "../models/account.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createAccountController = asyncHandler(async (req, res) => {
  const account = await accountModel.create({
    user: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, account, "Account created successfully"));
});

export const getUserAccountsController = asyncHandler(async (req, res) => {
  const accounts = await Account.find({
    user: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, accounts, "Accounts fetched successfully"));
});

export const getAccountBalanceController = asyncHandler(async (req, res) => {
  const { accountId } = req.params;

  const account = await Account.findOne({
    _id: accountId,
    user: req.user._id,
  });

  if (!account) {
    throw new ApiError(404, "Account not found");
  }

  const balance = await account.getBalance();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accountId: account._id,
        balance,
      },
      "Account balance fetched successfully",
    ),
  );
});
