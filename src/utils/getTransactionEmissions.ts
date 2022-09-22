import { EmissionsFactor, TransactionData } from "../types";

/**
 * for each txn, finds the entry in emissions factor table
 * (where the timestamp is greater than or equal to txn timestamp)
 * @returns [emissionsInKGCO2, gasUsed]
 */
export const getTransactionEmissions = (
  txns: TransactionData[],
  emissionsFactorTable: EmissionsFactor[]
): [number, number] => {
  let datePointer = 0;
  return txns.reduce(
    (prev, tx) => {
      // if the timestamp is older, try the next entry
      while (
        parseInt(tx.timeStamp) > emissionsFactorTable[datePointer].timestamp
      ) {
        if (datePointer === emissionsFactorTable.length - 1) {
          break;
        }
        datePointer++;
      }
      const txnEmissions =
        parseInt(tx.gasUsed) *
        emissionsFactorTable[datePointer].emissionsFactor;
      const sum = prev[0] + txnEmissions; // danger, floating point errors 0.30000000000000004
      const val: [number, number] = [
        Number(sum.toFixed(3)), // take nearest gram 0.00300000000000004 -> 0.003
        prev[1] + parseInt(tx.gasUsed),
      ];
      return val;
    },
    [0, 0]
  );
};
