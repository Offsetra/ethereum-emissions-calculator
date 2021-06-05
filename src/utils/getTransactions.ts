import { CalculatorOptions, TransactionData } from "../types";
import { fetchTransactions } from "./fetchTransactions";

const ETHERSCAN_RESULT_MAX_LENGTH = 10000;

export const getTransactions = async (
  options: CalculatorOptions
): Promise<TransactionData[]> => {
  const allTransactions = [];
  let startBlock = options.startBlock;
  let transactionsAreMissing = true;
  while (transactionsAreMissing) {
    const transactions = await fetchTransactions({ ...options, startBlock });
    if (transactions.length < ETHERSCAN_RESULT_MAX_LENGTH) {
      transactionsAreMissing = false;
      allTransactions.push(...transactions);
    } else {
      const lastTransaction = transactions[transactions.length - 1];
      const lastBlockNumber = Number(lastTransaction.blockNumber);
      // second fetch will start at lastBlockNumber
      startBlock = lastBlockNumber;
      // dedupe lastBlockNumber
      allTransactions.push(
        ...transactions.filter(
          (txn) => Number(txn.blockNumber) < lastBlockNumber
        )
      );
    }
  }
  return allTransactions;
};
