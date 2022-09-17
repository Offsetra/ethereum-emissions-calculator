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
      const val: [number, number] = [
        prev[0] +
          parseInt(tx.gasUsed) *
            emissionsFactorTable[datePointer].emissionsFactor,
        prev[1] + parseInt(tx.gasUsed),
      ];
      console.log(
        "fetched value",
        val,
        tx.timeStamp,
        emissionsFactorTable[datePointer].timestamp,
        emissionsFactorTable[datePointer].emissionsFactor
      );
      return val;
    },
    [0, 0]
  );
};
