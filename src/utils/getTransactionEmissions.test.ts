import { getTransactionEmissions } from "./getTransactionEmissions";
import { EmissionsFactor, TransactionData } from "../types";

const emissionFactors: EmissionsFactor[] = [
  { timestamp: 165100000, emissionsFactor: 0.001 },
  { timestamp: 165200000, emissionsFactor: 0.002 },
  { timestamp: 165300000, emissionsFactor: 0.0 },
];

describe("getTransactionEmissions", () => {
  test("returns transaction emissions", async () => {
    const transactions = [
      {
        timeStamp: "165100000", // first entry -> 0.001
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100", // 100 * 0.001 = 0.1
        hash: "duplicate",
      },
      {
        timeStamp: "165100001", // second entry -> 0.002
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100", // 100 * 0.002 = 0.2
        hash: "test2",
      },
    ] as TransactionData[];
    const result = getTransactionEmissions(transactions, emissionFactors);
    expect(result).toStrictEqual([0.3, 200]);
  });
  test("last txn is older than data", async () => {
    const transactions = [
      {
        timeStamp: "165100001", // should be second entry -> 0.002
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100", // 0.002 * 100 = 0.2
        hash: "duplicate",
      },
      {
        timeStamp: "165200000", // equal to second entry -> 0.002
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100", // 0.002 * 100 = 0.2
        hash: "test2",
      },
      {
        timeStamp: "165300001", // older than last txn -> take last
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100", // 0.0 * 100 = 0
        hash: "test2",
      },
    ] as TransactionData[];
    const result = getTransactionEmissions(transactions, emissionFactors);
    // 0.2 + 0.2 + 0 = 0.4
    // 100 + 100 + 100 = 300
    expect(result).toStrictEqual([0.4, 300]);
  });
  test("all txns are older than data", async () => {
    const transactions = [
      {
        timeStamp: "165300001",
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100",
        hash: "duplicate",
      },
      {
        timeStamp: "165300001",
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100",
        hash: "test2",
      },
      {
        timeStamp: "165300001",
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100",
        hash: "test2",
      },
    ] as TransactionData[];
    const result = getTransactionEmissions(transactions, emissionFactors);
    // 0.2 + 0.2 + 0 = 0.4
    // 100 + 100 + 100 = 300
    expect(result).toStrictEqual([0, 300]);
  });
});
