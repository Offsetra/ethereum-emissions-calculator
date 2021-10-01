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
          gasUsed: "1",
          hash: "duplicate",
        },
        {
          blockNumber: 111,
          from: address,
          to: address2,
          gasUsed: "1",
          hash: "duplicate",
        },
        {
          blockNumber: 1,
          from: address,
          to: address2,
          gasUsed: "1",
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
      gasUsed: 2,
      highestBlockNumber: 111,
      kgCO2: 0,
      lowestBlockNumber: 1,
      transactionsCount: 2,
    });
  });
});
