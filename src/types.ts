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

export interface EtherscanResponse {
  status: "0" | "1";
  message: string;
  result: TransactionData[];
}

export interface CalculatorOptions {
  /** Eth address for which you would like to calculate the CO2 emissions */
  address: string;
  /** Your Etherscan.io API Key */
  etherscanAPIKey: string;
  /** Optional. Whether the provided address is a smart contract. */
  isContract?: boolean;
  /** Optional. Query a specific range of blocks by providing a start block number. Default 0. */
  startBlock?: number;
  /** Optional. Query a specific range of blocks by providing an end block number. Default 99999999 (most recent block available). */
  endBlock?: number;
}

export interface AddressEmissionsResult {
  /** The total carbon footprint for all transactions of the provided type, sent from the provided address. In Kilograms of CO2e */
  kgCO2: number;
  /** The total number of transactions included for this query. */
  transactionsCount: number;
  /** Total sum of Gas Used for all transactions */
  gasUsed: number;
  /** False means the 10k limit was hit, so only the most recent 10k transactions were analyzed. */
  done: boolean;
  /** The block number of the most recent transaction found in the query */
  highestBlockNumber: number;
  /** The block number of the oldest transaction found in the query  */
  lowestBlockNumber: number;
}

export interface EmissionsFactor {
  /** Unix seconds */
  timestamp: number;
  /** Grams co2 per gas */
  emissionsFactor: number;
}

export interface CSVRecord {
  "Date(UTC)": string;
  UnixTimeStamp: string;
  Value: string;
}
