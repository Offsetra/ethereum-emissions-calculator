import { TransactionData } from "../types";

/**
 * Returns an array of transactions where txn.isError is not true.
 * This does not care about sender/reciever relationship (see filterValidOutgoingTransactions)
 */
export const filterValidTransactions = (
  transactions: TransactionData[]
): TransactionData[] => {
  return transactions.filter((txn: TransactionData) => {
    const succeeded = txn.isError !== "1";
    return succeeded;
  });
};
