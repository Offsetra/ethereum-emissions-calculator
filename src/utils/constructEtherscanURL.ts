import { CalculatorOptions } from "../types";

export const ETHERSCAN_API_URL = "https://api.etherscan.io/api";
export const ETHERSCAN_RESULT_MAX_LENGTH = 5000;

type ValidEtherscanParam =
  | "address"
  | "contractaddress"
  | "startBlock"
  | "endBlock"
  | "apikey"
  | "module"
  | "action"
  | "sort"
  | "page"
  | "offset";
type EtherscanParams = {
  [P in ValidEtherscanParam]: string;
};

export const constructEtherscanURL = (
  options: CalculatorOptions & { isContract?: boolean }
) => {
  const {
    address,
    etherscanAPIKey,
    startBlock,
    endBlock,
    isContract,
  } = options;
  const etherscanURL = new URL(ETHERSCAN_API_URL);
  const action = "txlist";
  const params: Partial<EtherscanParams> = {
    action,
    module: "account",
    sort: "desc",
    startBlock: startBlock?.toString() ?? "0",
    endBlock: endBlock?.toString() ?? "99999999",
    apikey: etherscanAPIKey,
    page: "1",
    offset: ETHERSCAN_RESULT_MAX_LENGTH.toString(),
  };
  for (const property in params) {
    etherscanURL.searchParams.append(
      property,
      params[property as ValidEtherscanParam]!
    );
  }
  if (action !== "txlist" && isContract) {
    etherscanURL.searchParams.append("contractaddress", address);
  } else {
    etherscanURL.searchParams.append("address", address);
  }
  return etherscanURL.toString();
};
