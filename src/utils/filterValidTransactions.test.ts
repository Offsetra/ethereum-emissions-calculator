import { TransactionData } from "../types";
import { filterValidTransactions } from "./filterValidTransactions";
import { getRandomHash } from "../test-fixtures/getRandomHash";

const SENDER = "0x5abfec25f74cd88437631a7731906932776356f9";
const RECIEVER = "0x3fb1cd2cd96c6d5c0b5eb3322d807b34482481d4";

describe("filterValidTransactions", () => {
  test("Return empty array if no valid transactions provided", () => {
    expect(filterValidTransactions([])).toStrictEqual([]);
  });
  test("remove txn if isError is 1", () => {
    const txns = [
      {
        to: RECIEVER,
        from: SENDER,
        isError: "1",
        hash: getRandomHash(),
      },
      {
        to: RECIEVER,
        from: SENDER,
        hash: getRandomHash(),
      },
    ] as TransactionData[];
    expect(filterValidTransactions(txns)).toHaveLength(1);
  });
  test("Do not remove txn if isError is 0 or undefined", () => {
    const txns = [
      {
        to: RECIEVER,
        from: SENDER,
        isError: "0",
        hash: getRandomHash(),
      },
      {
        to: RECIEVER,
        from: SENDER,
        hash: getRandomHash(),
      },
    ] as TransactionData[];
    expect(filterValidTransactions(txns)).toHaveLength(2);
  });
  test("Remove duplicates", () => {
    const txns = [
      {
        to: RECIEVER,
        from: SENDER,
        isError: "0",
        hash: "unique-hash",
      },
      {
        to: RECIEVER,
        from: SENDER,
        hash: "duplicate-hash",
      },
      {
        to: RECIEVER,
        from: SENDER,
        hash: "duplicate-hash",
      },
      {
        to: RECIEVER,
        from: SENDER,
        hash: "duplicate-hash",
      },
    ] as TransactionData[];
    expect(filterValidTransactions(txns)).toHaveLength(2);
  });
});
