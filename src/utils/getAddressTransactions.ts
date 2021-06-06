import { CalculatorOptions, TransactionData } from "../types";
import { fetchTransactions } from "./fetchTransactions";

const ETHERSCAN_RESULT_MAX_LENGTH = 10000;

/**
 * Fetch the most recent transactions, descending order (highest block # first)
 * Etherscan will return max 10k, so if we exceed this, we filter out the lowest block number (oldest)
 * i.e. this will return ALL transactions in that block, or none, but never partial.
 */
export const getAddressTransactions = async (
  options: CalculatorOptions
): Promise<{ transactions: TransactionData[]; done: boolean }> => {
  const transactions = await fetchTransactions(options);
  if (transactions.length < ETHERSCAN_RESULT_MAX_LENGTH) {
    return { done: true, transactions };
  }
  const lowestBlockNumber = transactions[transactions.length - 1].blockNumber;
  return {
    done: false, // we can't rely on the txn count for completeness (it might be slightly less than 10k after filtering)
    transactions: transactions.filter(
      (txn) => txn.blockNumber > lowestBlockNumber
    ),
  };
};
