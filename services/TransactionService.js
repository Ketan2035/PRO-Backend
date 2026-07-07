import Transaction from "../models/transactionSchema.js";

// Immutable ledger for financial events
export const createTransaction = async (data, session = null) => {
  const transaction = new Transaction(data);
  return await transaction.save({ session });
};

export const getTransactionsByUser = async (userId) => {
  return await Transaction.find({ userId }).sort({ createdAt: -1 });
};
