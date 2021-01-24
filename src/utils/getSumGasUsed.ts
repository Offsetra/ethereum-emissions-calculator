import { TransactionData } from "..";

const getSumGasUsed = (txns: TransactionData[]) =>
  txns.reduce((prev, txn) => {
    return Number(txn?.gasUsed ?? 0) + prev;
  }, 0);

export default getSumGasUsed;
