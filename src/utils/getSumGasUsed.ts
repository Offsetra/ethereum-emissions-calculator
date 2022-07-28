import { TransactionData } from "../types";

export const getSumGasUsed = (txns: TransactionData[]) =>
  txns.reduce((prev, txn) => {
    console.log(txn)
    return Number(txn?.gasUsed ?? 0) + prev;
  }, 0);
