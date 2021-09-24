import {
  CalculatorOptions,
  EtherscanResponse,
  TransactionData,
} from "../types";
import { constructEtherscanURL } from "./constructEtherscanURL";
import { fetchJSON } from "./fetchJSON";

export const fetchTransactions = async (
  options: CalculatorOptions & { isContract?: boolean }
): Promise<TransactionData[]> => {
  const response = await fetchJSON<EtherscanResponse>(
    constructEtherscanURL(options)
  );
  if (response.status === "0" && response.message === "No transactions found") {
    return [];
  }
  if (response.status !== "1") {
    throw new Error(`Failed to calculate emissions: ${response.message}`);
  }
  return response.result;
};
