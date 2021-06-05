import { TransactionData } from "../types";
import { getSumGasUsed } from "./getSumGasUsed";

const fixtures: TransactionData[] = [
  {
    gasUsed: 100,
  },
  {
    gasUsed: 0,
  },
  {
    gasUsed: 100,
  },
  {},
] as any;

describe("getSumGasUsed", () => {
  test("Returns 0 if no transactions", () => {
    expect(getSumGasUsed([])).toBe(0);
  });
  test("Returns proper sum of gasUsed", () => {
    expect(getSumGasUsed(fixtures)).toBe(200);
  });
});
