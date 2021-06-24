import { TransactionData } from "../types";

/**
 * Returns an array of transactions where;
 * `txn.from` matches the provided address (sender) and the txn.isError is not true
 */
export const filterValidOutgoingTransactions = (
  transactions: TransactionData[],
  address: string
): TransactionData[] => {
  return transactions.reduce<TransactionData[]>((prev, txn) => {
    // since response is sorted, we only need to compare hash of preceeding valid txn
    if (
      txn.from.toLowerCase() === address.toLowerCase() &&
      txn.isError !== "1" &&
      prev[prev.length - 1]?.hash !== txn.hash
    ) {
      return prev.concat([txn]);
    }
    return prev;
  }, []);
};
