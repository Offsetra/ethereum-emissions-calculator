import { CalculatorOptions, TransactionData } from "../types";
import { fetchTransactions } from "./fetchTransactions";

export const getTransactions = async (
  options: CalculatorOptions
): Promise<TransactionData[]> => {
  const allTransactions = [];
  let startBlock = options.startBlock;
  let transactionsAreMissing = true;
  while (transactionsAreMissing) {
    let transactions = await fetchTransactions(options);
    if (transactions.length < 10000) {
      transactionsAreMissing = false;
    } else {
      const lastTransaction = transactions[transactions.length - 1];
      const lastBlockNumber = Number(lastTransaction.blockNumber);
      transactions = transactions.filter(
        (transaction) => Number(transaction.blockNumber) < lastBlockNumber
      );
      startBlock = lastBlockNumber;
    }
    allTransactions.push(...transactions);
  }
  return allTransactions;
};
