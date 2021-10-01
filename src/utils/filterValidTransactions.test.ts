import { TransactionData } from "../types";
import { filterValidTransactions } from "./filterValidTransactions";
import { getRandomHash } from "../test-fixtures/getRandomHash";

const SENDER = "0x5abfec25f74cd88437631a7731906932776356f9";
const RECIEVER = "0x3fb1cd2cd96c6d5c0b5eb3322d807b34482481d4";

describe("filterValidTransactions", () => {
  test("Return empty array if no valid transactions provided", () => {
    expect(
      filterValidTransactions({
        transactions: [],
        isContract: false,
        address: SENDER,
      })
    ).toStrictEqual([]);
    expect(
      filterValidTransactions({
        transactions: [],
        isContract: true,
        address: SENDER,
      })
    ).toStrictEqual([]);
  });
  test("do not remove error transactions", () => {
    const transactions = [
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
        isError: "0",
      },
    ] as TransactionData[];
    expect(
      filterValidTransactions({
        transactions,
        isContract: false,
        address: SENDER,
      })
    ).toHaveLength(2);
  });
  test("Do not remove txn if isError is 0 or undefined", () => {
    const transactions = [
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
    expect(
      filterValidTransactions({
        transactions,
        isContract: false,
        address: SENDER,
      })
    ).toHaveLength(2);
  });
  test("Remove duplicates", () => {
    const transactions = [
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
    expect(
      filterValidTransactions({
        transactions,
        isContract: false,
        address: SENDER,
      })
    ).toHaveLength(2);
  });
  test("Remove incoming txn if isContract: false", () => {
    const transactions = [
      {
        to: SENDER,
        from: RECIEVER,
        hash: getRandomHash(),
      },
      {
        to: RECIEVER,
        from: SENDER,
        hash: getRandomHash(),
      },
      {
        to: SENDER,
        from: RECIEVER,
        hash: getRandomHash(),
      },
      {
        to: RECIEVER,
        from: SENDER,
        hash: getRandomHash(),
      },
    ] as TransactionData[];
    expect(
      filterValidTransactions({
        transactions,
        address: SENDER,
        isContract: false,
      })
    ).toHaveLength(2);
  });
});

describe("filterValidTransactions - isContract: true", () => {
  test("Return empty array if no valid transactions provided", () => {
    expect(
      filterValidTransactions({
        transactions: [],
        address: SENDER,
        isContract: true,
      })
    ).toStrictEqual([]);
  });
  test("do not remove txn if isError is 1", () => {
    const transactions = [
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
    expect(
      filterValidTransactions({
        transactions,
        address: SENDER,
        isContract: true,
      })
    ).toHaveLength(2);
  });
  test("Do not remove txn if isError is 0 or undefined", () => {
    const transactions = [
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
    expect(
      filterValidTransactions({
        transactions,
        address: SENDER,
        isContract: true,
      })
    ).toHaveLength(2);
  });
  test("Also include incoming txns if isContract: true", () => {
    const transactions = [
      {
        to: SENDER,
        from: RECIEVER,
        hash: getRandomHash(),
      },
      {
        to: RECIEVER,
        from: SENDER,
        hash: getRandomHash(),
      },
    ] as TransactionData[];
    expect(
      filterValidTransactions({
        transactions,
        address: SENDER,
        isContract: true,
      })
    ).toHaveLength(2);
  });
  test("Remove duplicates", () => {
    const transactions = [
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
      {
        to: RECIEVER,
        from: SENDER,
        isError: "0",
        hash: "unique-hash",
      },
      {
        to: SENDER,
        from: RECIEVER,
        isError: "0",
        hash: "unique-hash2",
      },
    ] as TransactionData[];
    expect(
      filterValidTransactions({
        transactions,
        address: SENDER,
        isContract: true,
      })
    ).toHaveLength(4);
  });
});
