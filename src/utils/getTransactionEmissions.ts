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
  // start at the newest emissions factor (last entry)
  let datePointer = emissionsFactorTable.length - 1;
  return txns.reduce(
    (prev, tx) => {
      // if the proceeding emissionsFactor.timestamp is still older than the transaction, decrement
      while (
        emissionsFactorTable[datePointer - 1]?.timestamp >=
        parseInt(tx.timeStamp)
      ) {
        if (datePointer === 0) {
          break;
        }
        datePointer--;
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
