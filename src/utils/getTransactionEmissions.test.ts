import { getTransactionEmissions } from "./getTransactionEmissions";
import { EmissionsFactor, TransactionData } from "../types";

const emissionFactors: EmissionsFactor[] = [
  { timestamp: 1000000000, emissionsFactor: 0 }, // oldest eth txn
  { timestamp: 1652000000, emissionsFactor: 0.002 },
  { timestamp: 1653000000, emissionsFactor: 0.003 },
  { timestamp: 1654000000, emissionsFactor: 0.004 },
  { timestamp: 1655000000, emissionsFactor: 0.0 }, // pretend post-merge
];

describe("getTransactionEmissions", () => {
  test("returns transaction emissions", async () => {
    const transactions = [
      {
        timeStamp: "1665000000", // younger than dataset, 0
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100", // 0
        hash: "duplicate",
      },
      {
        timeStamp: "1654000000", // 4th entry -> 0.004
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100", // 100 * 0.004 = 0.4
        hash: "duplicate",
      },
      {
        timeStamp: "1653000000", // 3rd entry -> 0.003
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100", // 100 * 0.003 = 0.3
        hash: "test2",
      },

      {
        timeStamp: "1000000000", // oldest possible
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100",
        hash: "test2",
      },
    ] as TransactionData[];
    const result = getTransactionEmissions(transactions, emissionFactors);
    expect(result).toStrictEqual([0.7, 400]);
  });
  test("all txns are newer than data", async () => {
    const transactions = [
      {
        timeStamp: "1655000002", // 0
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100",
        hash: "duplicate",
      },
      {
        timeStamp: "1655000001", // 0
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100",
        hash: "test2",
      },
      {
        timeStamp: "1655000000", // 0
        from: "0x063dd253c8da4ea9b12105781c9611b8297f5d14",
        to: "0x5abfec25f74cd88437631a7731906932776356f9",
        gasUsed: "100",
        hash: "test2",
      },
    ] as TransactionData[];
    const result = getTransactionEmissions(transactions, emissionFactors);
    expect(result).toStrictEqual([0, 300]);
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
