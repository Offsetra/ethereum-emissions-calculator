import { CalculatorOptions } from "../types";
import { constructEtherscanURL } from "./constructEtherscanURL";

const SENDER = "0x063dd253c8da4ea9b12105781c9611b8297f5d14";

describe("constructEtherscanURL", () => {
  test("constructs valid string with default params", () => {
    const valid =
      "https://api.etherscan.io/api?action=txlist&module=account&sort=desc&startBlock=0&endBlock=99999999&apikey=test-api-key&address=0x063dd253c8da4ea9b12105781c9611b8297f5d14";
    const options: CalculatorOptions = {
      address: SENDER,
      etherscanAPIKey: "test-api-key",
      transactionType: "eth",
    };
    const url = constructEtherscanURL(options);
    expect(url).toContain("action=txlist");
    expect(url).toContain("&module=account");
    expect(url).toContain("&sort=desc");
    expect(url).toContain("&address=" + SENDER);
    expect(url).toContain("&startBlock=0");
    expect(url).toContain("&endBlock=99999999");
    expect(url).toContain("&apikey=test-api-key");
    expect(url).not.toContain("contractaddress");
    expect(url).toStrictEqual(valid);
  });
  test("supports eth, erc20, erc721", () => {
    const options: CalculatorOptions = {
      address: SENDER,
      etherscanAPIKey: "test-api-key",
      transactionType: "eth",
    };
    expect(constructEtherscanURL(options)).toContain("action=txlist");
    expect(constructEtherscanURL(options)).not.toContain("contractaddress");
    expect(
      constructEtherscanURL({ ...options, transactionType: "erc20" })
    ).toContain("action=tokentx");
    expect(
      constructEtherscanURL({ ...options, transactionType: "erc721" })
    ).toContain("action=tokennfttx");
  });
  test("uses contractaddress param", () => {
    const options: CalculatorOptions & { isContract?: boolean } = {
      address: SENDER,
      etherscanAPIKey: "test-api-key",
      transactionType: "eth",
      isContract: true,
    };
    expect(constructEtherscanURL(options)).toContain("action=txlist");
    expect(constructEtherscanURL(options)).not.toContain("contractaddress");
    expect(
      constructEtherscanURL({ ...options, transactionType: "erc20" })
    ).toContain("action=tokentx");
    expect(
      constructEtherscanURL({ ...options, transactionType: "erc20" })
    ).toContain("contractaddress");
    expect(
      constructEtherscanURL({ ...options, transactionType: "erc721" })
    ).toContain("action=tokennfttx");
    expect(
      constructEtherscanURL({ ...options, transactionType: "erc721" })
    ).toContain("contractaddress");
  });
});
