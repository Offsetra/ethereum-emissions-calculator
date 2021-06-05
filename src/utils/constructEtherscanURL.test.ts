import { CalculatorOptions } from "../types";
import { constructEtherscanURL } from "./constructEtherscanURL";

const SENDER = "0x063dd253c8da4ea9b12105781c9611b8297f5d14";

describe("constructEtherscanURL", () => {
  test("constructs valid string with default params", () => {
    const valid =
      "https://api.etherscan.io/api?action=txlist&module=account&sort=asc&address=0x063dd253c8da4ea9b12105781c9611b8297f5d14&startBlock=0&endBlock=99999999&apikey=test-api-key";
    const options: CalculatorOptions = {
      address: SENDER,
      etherscanAPIKey: "test-api-key",
      transactionType: "eth",
    };
    expect(constructEtherscanURL(options)).toContain("action=txlist");
    expect(constructEtherscanURL(options)).toContain("&module=account");
    expect(constructEtherscanURL(options)).toContain("&sort=asc");
    expect(constructEtherscanURL(options)).toContain("&address=" + SENDER);
    expect(constructEtherscanURL(options)).toContain("&startBlock=0");
    expect(constructEtherscanURL(options)).toContain("&endBlock=99999999");
    expect(constructEtherscanURL(options)).toContain("&apikey=test-api-key");
    expect(constructEtherscanURL(options)).toStrictEqual(valid);
  });
  test("supports eth, erc20, erc721", () => {
    const options: CalculatorOptions = {
      address: SENDER,
      etherscanAPIKey: "test-api-key",
      transactionType: "eth",
    };
    expect(constructEtherscanURL(options)).toContain("action=txlist");
    expect(
      constructEtherscanURL({ ...options, transactionType: "erc20" })
    ).toContain("action=tokentx");
    expect(
      constructEtherscanURL({ ...options, transactionType: "erc721" })
    ).toContain("action=tokennfttx");
  });
});
