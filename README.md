# Ethereum Carbon Emissions Calculator

JavaScript utility to calculate the CO2 emissions of any Ethereum address.

The tool is written in TypeScript and powered by the the Etherscan.io API & an open-source carbon accounting methodology under development by Offsetra.
We hope this tool is useful for raising awareness and understanding with regards to the rapidly growing carbon emissions of cryptocurrency mining.

Questions, comments, forks and PRs all very much appreciated!

License: MIT

## Usage

Provide an address and a transaction type, and the calculator will tell you how many emissions this represents in KG CO2e.
To calculate the sum total of your addresses' lifetime emissions, you must combine the sum of `eth`, `erc20`, and `erc721` emissions.

```javascript
const emissions = calculateAddressEmissions({
  /** The type of transactions you wish to query */
  transactionType: "eth" | "erc20" | "erc721";
  /** Eth address for which you would like to calculate */
  address: string;
  /** Your Etherscan.io API Key */
  etherscanAPIKey: string;
  /** Optional. Query a specific range of blocks by providing a start block number. Default 0. */
  startBlock?: number;
  /** Optional. Query a specific range of blocks by providing an end block number. Default 99999999 (most recent block available). */
  endBlock?: number;
})
```

## Methodology

Emissions are calculated based on the transactions initiated (sent) by the provided address.
The total emissions are derived from the amount of `gas` used for each transaction.

More on this coming soon!
