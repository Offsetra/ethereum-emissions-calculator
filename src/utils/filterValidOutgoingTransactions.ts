import { TransactionData } from "..";

/** Returns an array of transactions where;
 * `txn.from` matches the provided address (sender) and the txn.isError is not true
 */
const filterValidOutgoingTransactions = (
  transactions: TransactionData[],
  address: string
): TransactionData[] => {
  return transactions.filter((txn: TransactionData) => {
    const isOutgoing = txn.from.toLowerCase() === address.toLowerCase();
    const succeeded = txn.isError !== "1";
    return isOutgoing && succeeded;
  });
};

export default filterValidOutgoingTransactions;
