import { TransactionData } from "..";

const getSumGasUsed = (txns: TransactionData[]) =>
  txns.reduce((prev, txn) => {
    return Number(txn.gasUsed) + prev;
  }, 0);

export default getSumGasUsed;
