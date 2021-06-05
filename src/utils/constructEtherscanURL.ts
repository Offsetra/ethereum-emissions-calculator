import { CalculatorOptions } from "../types";

export const ETHERSCAN_API_URL = "https://api.etherscan.io/api";

type ValidEtherscanParam =
  | "address"
  | "startBlock"
  | "endBlock"
  | "apikey"
  | "module"
  | "action"
  | "sort";
type EtherscanParams = {
  [P in ValidEtherscanParam]: string;
};

export const constructEtherscanURL = (options: CalculatorOptions) => {
  const { address, etherscanAPIKey, startBlock, endBlock } = options;
  const etherscanURL = new URL(ETHERSCAN_API_URL);
  const action = {
    eth: "txlist",
    erc20: "tokentx",
    erc721: "tokennfttx",
  }[options.transactionType];
  const params: EtherscanParams = {
    action,
    module: "account",
    sort: "asc",
    address: address,
    startBlock: startBlock?.toString() ?? "0",
    endBlock: endBlock?.toString() ?? "99999999",
    apikey: etherscanAPIKey,
  };
  for (const property in params) {
    etherscanURL.searchParams.append(
      property,
      params[property as ValidEtherscanParam]
    );
  }
  return etherscanURL.toString();
};
