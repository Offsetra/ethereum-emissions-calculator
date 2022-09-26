import { calculateEmissions } from ".";
import { getAddressTransactions } from "./utils/getAddressTransactions";

const address = "0x063dd253c8da4ea9b12105781c9611b8297f5d14";
const address2 = "0x5abfec25f74cd88437631a7731906932776356f9";

const etherscanAPIKey = "test";

jest.mock("./utils/getAddressTransactions");

describe("calculateEmissions", () => {
  test("returns block range", async () => {
    (getAddressTransactions as jest.Mock).mockResolvedValue({
      transactions: [
        {
          blockNumber: 111,
          from: address,
          to: address2,
          gasUsed: "1000",
          hash: "duplicate",
        },
        {
          blockNumber: 1,
          from: address,
          to: address2,
          gasUsed: "1000",
          hash: "test2",
        },
      ],
      done: true,
    });

    const result = await calculateEmissions({
      address,
      etherscanAPIKey,
      isContract: false,
      startBlock: 0,
      endBlock: 999,
    });

    expect(result).toStrictEqual({
      done: true,
      gasUsed: 2000,
      highestBlockNumber: 111, // most recent block is first in array
      kgCO2: 0,
      lowestBlockNumber: 1, // oldest block is end of array
      transactionsCount: 2,
    });
  });
  test("ignores duplicates", async () => {
    (getAddressTransactions as jest.Mock).mockResolvedValue({
      transactions: [
        {
          blockNumber: 111,
          from: address,
          to: address2,
          gasUsed: "1000",
          hash: "duplicate",
        },
        {
          blockNumber: 111,
          from: address,
          to: address2,
          gasUsed: "1000",
          hash: "duplicate",
        },
        {
          blockNumber: 1,
          from: address,
          to: address2,
          gasUsed: "1000",
          hash: "test2",
        },
      ],
      done: true,
    });

    const result = await calculateEmissions({
      address,
      etherscanAPIKey,
      isContract: false,
      startBlock: 0,
      endBlock: 999,
    });

    expect(result).toStrictEqual({
      done: true,
      gasUsed: 2000,
      highestBlockNumber: 111,
      kgCO2: 0,
      lowestBlockNumber: 1,
      transactionsCount: 2,
    });
  });
  test("rounds to nearest gram", async () => {
    (getAddressTransactions as jest.Mock).mockResolvedValue({
      transactions: [
        {
          blockNumber: 15591851,
          from: address,
          to: address2,
          gasUsed: "100000",
          hash: "test1",
          timeStamp: "1663200000", // emissionsFactor: 0.0002522790155063084
        },
        {
          blockNumber: 15590000,
          from: address,
          to: address2,
          gasUsed: "100000",
          timeStamp: "1661990400", // emissionsFactor: 0.0002473976222064128
        },
      ],
      done: true,
    });

    const result = await calculateEmissions({
      address,
      etherscanAPIKey,
      isContract: false,
      startBlock: 0,
      endBlock: 999,
    });
    // 25.2279015506 + 24.7397622206 = 49.9676637712
    expect(result).toStrictEqual({
      done: true,
      gasUsed: 200000,
      highestBlockNumber: 15591851,
      kgCO2: 49.968,
      lowestBlockNumber: 15590000,
      transactionsCount: 2,
    });
  });
  test("Include a post-merge txn", async () => {
    (getAddressTransactions as jest.Mock).mockResolvedValue({
      transactions: [
        {
          blockNumber: 15591851,
          from: address,
          to: address2,
          gasUsed: "100000",
          hash: "test1",
          timeStamp: "1663286401", // emissionsFactor: 0
        },
        {
          blockNumber: 15590000,
          from: address,
          to: address2,
          gasUsed: "100000",
          timeStamp: "1658361599", // emissionsFactor: 0.00023921697826715505
        },
      ],
      done: true,
    });

    const result = await calculateEmissions({
      address,
      etherscanAPIKey,
      isContract: false,
      startBlock: 0,
      endBlock: 999,
    });

    expect(result).toStrictEqual({
      done: true,
      gasUsed: 200000,
      highestBlockNumber: 15591851,
      kgCO2: 23.922,
      lowestBlockNumber: 15590000,
      transactionsCount: 2,
    });
  });
  test("all post-merge txns", async () => {
    (getAddressTransactions as jest.Mock).mockResolvedValue({
      transactions: [
        {
          blockNumber: 15591851,
          from: address,
          to: address2,
          gasUsed: "100000",
          hash: "test1",
          timeStamp: "1663286400", // emissionsFactor: 0.0
        },
        {
          blockNumber: 15590000,
          from: address,
          to: address2,
          gasUsed: "100000",
          timeStamp: "1663286401", // emissionsFactor: 0.0
        },
      ],
      done: true,
    });

    const result = await calculateEmissions({
      address,
      etherscanAPIKey,
      isContract: false,
      startBlock: 0,
      endBlock: 999,
    });

    expect(result).toStrictEqual({
      done: true,
      gasUsed: 200000,
      highestBlockNumber: 15591851,
      kgCO2: 0,
      lowestBlockNumber: 15590000,
      transactionsCount: 2,
    });
  });
});
