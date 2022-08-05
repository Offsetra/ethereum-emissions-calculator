import { TransactionData } from "../types";

interface Params {
  transactions: TransactionData[];
  address: string;
  isContract: boolean;
}

/**
 * Returns an array of transactions where txn.isError is not true.
 */
export const filterValidTransactions = (params: Params): TransactionData[] => {
  return params.transactions.reduce<TransactionData[]>((prev, txn) => {
    if (
      (params.isContract || // contracts include incoming
        txn.from.toLowerCase() === params.address.toLowerCase()) && // normal address only include outgoing
      prev[prev.length - 1]?.hash !== txn.hash
    ) {
      return prev.concat([txn]);
    }
    return prev;
  }, []);
};
