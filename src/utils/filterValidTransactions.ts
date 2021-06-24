import { TransactionData } from "../types";

/**
 * Returns an array of transactions where txn.isError is not true.
 * This does not care about sender/reciever relationship (see filterValidOutgoingTransactions)
 */
export const filterValidTransactions = (
  transactions: TransactionData[]
): TransactionData[] => {
  return transactions.reduce<TransactionData[]>((prev, txn) => {
    // since response is sorted, we only need to compare hash of preceeding valid txn
    if (txn.isError !== "1" && prev[prev.length - 1]?.hash !== txn.hash) {
      return prev.concat([txn]);
    }
    return prev;
  }, []);
};
