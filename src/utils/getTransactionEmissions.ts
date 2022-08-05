import { EmissionsFactor, TransactionData } from "../types";

export const getTransactionEmissions = (
  txns: TransactionData[],
  emissionsFactorTable: EmissionsFactor[]
): [number, number] => {
  let datePointer = 0;
  return txns.reduce(
    (prev, tx) => {
      const notLast = datePointer < emissionsFactorTable.length - 1;
      const txnIsOlder =
        parseInt(tx.timeStamp) > emissionsFactorTable[datePointer].timestamp;
      while (notLast && txnIsOlder) {
        datePointer++;
      }
      return [
        prev[0] +
          parseInt(tx.gasUsed) *
            emissionsFactorTable[datePointer].emissionsFactor,
        prev[1] + parseInt(tx.gasUsed),
      ];
    },
    [0, 0]
  );
};
