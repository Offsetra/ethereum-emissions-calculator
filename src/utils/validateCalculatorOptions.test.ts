import { CalculatorOptions } from "../types";
import { validateCalculatorOptions } from "./validateCalculatorOptions";

const SENDER = "0x063dd253c8da4ea9b12105781c9611b8297f5d14";

describe("validateCalculatorOptions", () => {
  test("throws", () => {
    expect(() => validateCalculatorOptions({} as any)).toThrow();
  });
  test("return void if all options are valid", () => {
    const options: CalculatorOptions = {
      address: SENDER,
      etherscanAPIKey: "test-key",
    };
    expect(validateCalculatorOptions(options)).toBe(undefined);
    expect(
      validateCalculatorOptions({ ...options, startBlock: 1, endBlock: 2 })
    ).toBe(undefined);
  });
  test("throws if no address", () => {
    const options = {
      etherscanAPIKey: "test-key",
    } as CalculatorOptions;
    expect(() => validateCalculatorOptions(options)).toThrow();
  });
  test("throws if address too short", () => {
    const options = {
      etherscanAPIKey: "test-key",
      address: "0xabcd",
    } as CalculatorOptions;
    expect(() => validateCalculatorOptions(options)).toThrow();
  });
  test("throws if address does not start with 0x", () => {
    const options = {
      etherscanAPIKey: "test-key",
      address: "Ox063dd253c8da4ea9b12105781c9611b8297f5d14",
    } as CalculatorOptions;
    expect(() => validateCalculatorOptions(options)).toThrow();
  });
});
