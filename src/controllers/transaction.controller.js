import mongoose from "mongoose";

import { transactionModel } from "../models/transaction.model.js";
import { ledgerModel } from "../models/ledger.model.js";
import { accountModel } from "../models/account.model.js";

import { sendRegistrationEmail } from "../services/email.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

export const createTransaction = asyncHandler(async (req, res) => {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  /**
   * 1. Validate request
   */
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    throw new ApiError(
      400,
      "fromAccount, toAccount, amount and idempotencyKey are required",
    );
  }

  const fromUserAccount = await accountModel.findById(fromAccount);
  const toUserAccount = await accountModel.findById(toAccount);

  if (!fromUserAccount || !toUserAccount) {
    throw new ApiError(400, "Invalid fromAccount or toAccount");
  }

  /**
   * 2. Validate idempotency key
   */
  const existingTransaction = await transactionModel.findOne({
    idempotencyKey,
  });

  if (existingTransaction) {
    if (existingTransaction.status === "COMPLETED") {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            existingTransaction,
            "Transaction already processed",
          ),
        );
    }

    if (existingTransaction.status === "PENDING") {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Transaction is still processing"));
    }

    if (
      existingTransaction.status === "FAILED" ||
      existingTransaction.status === "REVERSED"
    ) {
      throw new ApiError(500, "Transaction processing failed, please retry");
    }
  }

  /**
   * 3. Check account status
   */
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    throw new ApiError(400, "Both accounts must be ACTIVE");
  }

  /**
   * 4. Check balance
   */
  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    throw new ApiError(
      400,
      `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`,
    );
  }

  /**
   * 5. Create transaction
   */

  let transaction;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING",
          },
        ],
        { session },
      )
    )[0];

    /**
     * 6. Debit Entry
     */
    await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    /**
     * Artificial Delay
     */
    await new Promise((resolve) => setTimeout(resolve, 15000));

    /**
     * 7. Credit Entry
     */
    await ledgerModel.create(
      [
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    /**
     * 8. Complete Transaction
     */
    transaction.status = "COMPLETED";
    await transaction.save({ session });

    /**
     * 9. Commit
     */
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();

    throw new ApiError(
      500,
      "Transaction is pending due to some issue, please retry after sometime",
    );
  } finally {
    session.endSession();
  }

  /**
   * 10. Send Email
   */
  await sendRegistrationEmail.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount,
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, transaction, "Transaction completed successfully"),
    );
});

export const createInitialFundsTransaction = asyncHandler(async (req, res) => {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    throw new ApiError(
      400,
      "toAccount, amount and idempotencyKey are required",
    );
  }

  const toUserAccount = await accountModel.findById(toAccount);

  if (!toUserAccount) {
    throw new ApiError(400, "Invalid toAccount");
  }

  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    throw new ApiError(400, "System user account not found");
  }

  const session = await mongoose.startSession();

  let transaction;

  try {
    session.startTransaction();

    transaction = new transactionModel({
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    });

    await ledgerModel.create(
      [
        {
          account: fromUserAccount._id,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    await ledgerModel.create(
      [
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    transaction.status = "COMPLETED";

    await transaction.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();

    throw new ApiError(500, "Failed to create initial funds transaction");
  } finally {
    session.endSession();
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        transaction,
        "Initial funds transaction completed successfully",
      ),
    );
});
