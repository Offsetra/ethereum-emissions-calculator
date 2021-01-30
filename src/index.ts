import constructEtherscanURL from "./utils/constructEtherscanURL";
import fetchJSON from "./utils/fetchJSON";
import filterValidOutgoingTransactions from "./utils/filterValidOutgoingTransactions";
import getSumGasUsed from "./utils/getSumGasUsed";
import validateCalculatorOptions from "./utils/validateCalculatorOptions";

/**
 * Based on 2019 methodology, see README.md for details
 * TODO: host the entire emissions methodology in this repo & re-calculate the emissons factor on a rolling basis!
 * */
const KG_CO2_PER_GAS = 0.0003100393448;

/** This is the API response for a normal, internal, token or NFT transaction query */
export interface TransactionData {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
  value?: string;
  tokenID?: string;
  type?: string;
  traceId?: string;
  isError?: "0" | "1";
  errCode?: string;
  txreceipt_status?: string;
}

interface EtherscanResponse {
  status: "0" | "1";
  message: string;
  result: TransactionData[];
}

export interface CalculatorOptions {
  /** The type of transactions you wish to query.
   * The total wallet emissions is equal to the sum of all three queries.
   * Must query separately due to Etherscan.io API limitations */
  transactionType: "eth" | "erc20" | "erc721";
  /** Eth address for which you would like to calculate the CO2 emissions */
  address: string;
  /** Your Etherscan.io API Key */
  etherscanAPIKey: string;
  /** Optional. Query a specific range of blocks by providing a start block number. Default 0. */
  startBlock?: number;
  /** Optional. Query a specific range of blocks by providing an end block number. Default 99999999 (most recent block available). */
  endBlock?: number;
}

export interface AddressEmissionsResult {
  /** The transaction type which was queried. */
  transactionType: CalculatorOptions["transactionType"];
  /** The total carbon footprint for all transactions of the provided type, sent from the provided address. In Kilograms of CO2e */
  kgCO2: number;
  /** The total number of transactions included for this query. Maximum: 1000 */
  transactionsCount: number;
  /** Total sum of Gas Used for all transactions */
  gasUsed: number;
}

export const calculateAddressEmissions = async (
  options: CalculatorOptions
): Promise<AddressEmissionsResult> => {
  validateCalculatorOptions(options);
  const response = await fetchJSON<EtherscanResponse>(
    constructEtherscanURL(options)
  );
  if (response.status === "0" && response.message === "No transactions found") {
    return {
      transactionType: options.transactionType,
      kgCO2: 0,
      transactionsCount: 0,
      gasUsed: 0,
    };
  }
  if (response.status !== "1") {
    throw new Error(
      `Failed to calculate address emissions: ${response.message}`
    );
  }
  const txns = filterValidOutgoingTransactions(
    response.result,
    options.address
  );
  const totalGasUsed = getSumGasUsed(txns);
  return {
    transactionType: options.transactionType,
    kgCO2: Math.round(totalGasUsed * KG_CO2_PER_GAS),
    transactionsCount: txns.length,
    gasUsed: totalGasUsed,
  };
};
