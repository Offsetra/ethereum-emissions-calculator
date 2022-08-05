import { EmissionsFactor, TransactionData } from "../types";

export const getTransactionEmissions = (
  txns: TransactionData[],
  emissionsFactorTable: EmissionsFactor[]
) => {
  let datePointer = 0;
  return txns.reduce((prev, tx) => {
    const notLast = datePointer < emissionsFactorTable.length - 1;
    const txnIsOlder =
      parseInt(tx.timeStamp) > emissionsFactorTable[datePointer].timestamp;
    while (notLast && txnIsOlder) {
      datePointer++;
    }
    return (
      prev +
      parseInt(tx.gasUsed) * emissionsFactorTable[datePointer].emissionsFactor
    );
  }, 0);
};
