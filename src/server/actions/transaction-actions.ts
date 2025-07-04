"use server";

import type {
  InsertTransaction,
  TransactionType,
} from "@/lib/schema/schema-types";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import { createProtectedAction } from "@/server/helpers/action-factory";
import {
  getAll as getAllTransactionsRepo,
  getById as getTransactionByIdRepo,
  create_with_warehouse_item as createWithWarehouseItem,
  create as createTransactionRepo,
  getByType as getTransactionsByTypeRepo,
  getByTimeIntervalWithWith,
} from "../repos/transaction-repo";

export const getTransactions = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user) => {
    const transactions = await getAllTransactionsRepo(user.businessId!);
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    return { data: transactions.data, error: null };
  }
);

export const getTransactionsByTimeInterval = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user, { startDate, endDate }: { startDate: Date; endDate: Date }) => {
    const transactions = await getByTimeIntervalWithWith(
      user.businessId!,
      startDate,
      endDate
    );
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    return { data: transactions.data, error: null };
  }
);

export const getTransactionById = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user, transactionId: string) => {
    if (!transactionId?.trim()) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const transaction = await getTransactionByIdRepo(
      transactionId,
      user.businessId!
    );
    if (transaction.error) {
      return { data: null, error: transaction.error };
    }
    return { data: transaction.data, error: null };
  }
);

export const createTransaction = createProtectedAction(
  Permission.TRANSACTION_PURCHASE_CREATE,
  async (
    user,
    transactionData: Omit<InsertTransaction, "businessId" | "id" | "createdBy">
  ) => {
    if (
      !transactionData.productId?.trim() ||
      !transactionData.warehouseItemId?.trim() ||
      !transactionData.type ||
      typeof transactionData.quantity !== "number"
    ) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const transaction: InsertTransaction = {
      ...transactionData,
      businessId: user.businessId!,
      createdBy: user.id,
    };
    const { data: resData, error: resError } =
      await createTransactionRepo(transaction);
    if (resError) {
      return { data: null, error: resError };
    }

    return { data: resData, error: null };
  }
);

export const createTransactionAndWarehouseItem = createProtectedAction(
  Permission.TRANSACTION_PURCHASE_CREATE,
  async (
    user,
    transactionData: Omit<
      InsertTransaction,
      "businessId" | "id" | "createdBy" | "warehouseItemId"
    >
  ) => {
    if (
      !transactionData.productId?.trim() ||
      !transactionData.type ||
      typeof transactionData.quantity !== "number"
    ) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const transaction = {
      ...transactionData,
      businessId: user.businessId!,
      createdBy: user.id,
    };
    const { data: resData, error: resError } =
      await createWithWarehouseItem(transaction);
    if (resError) {
      return { data: null, error: resError };
    }
    return { data: resData, error: null };
  }
);

export const getTransactionsByType = createProtectedAction(
  Permission.FINANCIAL_VIEW,
  async (user, type: TransactionType) => {
    if (!type) {
      return { data: null, error: ErrorCode.MISSING_INPUT };
    }
    const transactions = await getTransactionsByTypeRepo(
      user.businessId!,
      type
    );
    if (transactions.error) {
      return { data: null, error: transactions.error };
    }
    return { data: transactions.data, error: null };
  }
);
