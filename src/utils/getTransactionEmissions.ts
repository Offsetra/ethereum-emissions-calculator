import { EmissionsFactor, TransactionData } from "../types";

/** returns [emissionsInKGCO2, gasUsed] */
export const getTransactionEmissions = (
  txns: TransactionData[],
  emissionsFactorTable: EmissionsFactor[]
): [number, number] => {
  let datePointer = 0;
  return txns.reduce(
    (prev, tx) => {
      const txnIsOlder =
        parseInt(tx.timeStamp) > emissionsFactorTable[datePointer].timestamp;
      while (txnIsOlder) {
        if (datePointer === emissionsFactorTable.length - 1) {
          break;
        }
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
