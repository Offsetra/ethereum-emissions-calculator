import { CalculatorOptions } from "../types";
import { getTransactions } from "./getTransactions";
import { fetchTransactions as mockFetchTransactions } from "./fetchTransactions";

/**
 * TODOS:
 * - make these tests pass
 * - sort desc and use block number for loading indicator
 */

const txnFixture1 = {
  blockNumber: "10000",
};
const txnFixture2 = {
  blockNumber: "20000",
};
const txnFixture3 = {
  blockNumber: "30000",
};

const generateTxnArray = (params: { length: number; fixture: any }) => {
  return new Array(params.length).fill(params.fixture);
};

jest.mock("./fetchTransactions");

const fetchTransactions = mockFetchTransactions as jest.Mock;

afterEach(() => {
  jest.resetAllMocks();
});

describe("getTransactions", () => {
  const address = "0xTEST";
  const etherscanAPIKey = "TEST_KEY";

  test("fetches 1 transaction", async () => {
    const options: CalculatorOptions = {
      address,
      etherscanAPIKey,
      transactionType: "eth",
    };
    const expected = generateTxnArray({ length: 1, fixture: txnFixture1 });
    fetchTransactions.mockImplementationOnce(async () => {
      return expected;
    });

    const result = await getTransactions(options);
    expect(result).toStrictEqual(expected);
    expect(fetchTransactions).toHaveBeenCalledTimes(1);
  });
  test("fetches 9999 transactions", async () => {
    const options: CalculatorOptions = {
      address,
      etherscanAPIKey,
      transactionType: "eth",
    };
    const expected = generateTxnArray({ length: 9999, fixture: txnFixture1 });
    fetchTransactions.mockImplementationOnce(async () => {
      return expected;
    });

    const result = await getTransactions(options);
    expect(result).toStrictEqual(expected);
    expect(fetchTransactions).toHaveBeenCalledTimes(1);
  });
  test("fetches 11,000 transactions, refetching highest blocknumber, without duplicates", async () => {
    const options: CalculatorOptions = {
      address,
      etherscanAPIKey,
      transactionType: "eth",
    };
    const firstBlock = generateTxnArray({
      length: 5000,
      fixture: txnFixture1,
    });
    const secondBlockPartial = generateTxnArray({
      length: 5000, // actually ethereum only has 70 txns per block but it doesnt matter for this fn
      fixture: txnFixture2,
    });
    const secondBlockFull = generateTxnArray({
      length: 6000,
      fixture: txnFixture2,
    });
    const firstResult = firstBlock.concat(secondBlockPartial);
    const secondResult = secondBlockFull;

    fetchTransactions
      .mockImplementationOnce(async () => {
        return firstResult;
      })
      .mockImplementationOnce(async () => {
        return secondResult;
      });

    const result = await getTransactions(options);
    expect(result).toStrictEqual(firstBlock.concat(secondBlockFull));
    expect(fetchTransactions).toHaveBeenCalledTimes(2);
    expect(fetchTransactions).toHaveBeenLastCalledWith({
      ...options,
      startBlock: Number(txnFixture2.blockNumber),
    });
    expect(result.length).toBe(11000);
  });
});
