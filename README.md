# Ethereum Carbon Emissions Calculator

Made with ♥ by [Offsetra.com](https://offsetra.com/about) for [carbon.fyi](https://carbon.fyi).
Questions, comments, forks and PRs all very much appreciated!

License: **NON-COMMERCIAL USE ONLY**. Creative Commons BY-NC-SA.
To request a commercial-use license contact support@offsetra.com.

## Summary

JavaScript utility to calculate the CO2 emissions of any Ethereum address or contract.

The tool is written in TypeScript and powered by the the Etherscan.io API & an open-source carbon accounting methodology under development by Offsetra.
We hope this tool is useful for raising awareness and understanding with regards to the rapidly growing carbon emissions of cryptocurrency mining.

## Usage

This calculator should work in any client or server-side JavaScript environment.

```
npm install ethereum-emissions-calculator
```

The calculator exports two methods:

- `calculateAddressEmissions`
- `calculateContractEmissions`

### calculateAddressEmissions

`calculateAddressEmissions` will only allocate emissions for outgoing (sent) transactions.

Provide an `address` and a `transactionType`, and the calculator will tell you how many emissions this represents in KG CO2e.
To calculate the sum total emissions for an address, you must combine the sum of `eth`, `erc20`, and `erc721` emissions.

```typescript
import { calculateAddressEmissions } from "ethereum-emissions-calculator";
import { address, etherscanAPIKey } from "data";

const emissions = await calculateAddressEmissions({
  transactionType: "eth", // "eth" | "erc20" | "erc721"
  address, // 0x12345[...]
  etherscanAPIKey,
});

// returns:
export interface AddressEmissionsResult {
  /** The transaction type which was queried. */
  transactionType: CalculatorOptions["transactionType"];
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
```

### calculateContractEmissions

The only difference between this method and `calculateAddressEmissions`, is that this method will also calculate and add emissions from _incoming_ transactions.
We have included this method at the request of platforms who are interested in calculating the collective impact of their contract, however for most cases we think `calculateAddressEmissions` makes more sense (to avoid double-counting the same emissions-- sender takes responsibility!)

## Caveats & Breaking Changes

As of version 2.0 and greater, each invocation of `calculateAddressEmissions()` or `calculateAddressEmissions()` will return a **maximum of 10k transactions**.
Before version 2.0, the calculator attempted to recursively fetch the remaining transactions until the entire history had been retrieved. This caused problems with huge addresses or lower-memory devices. It is now up to the developer to re-fetch the remaining transactions (the calculator now returns the `highestBlockNumber` and `lowestBlockNumber` to help you find the next chunk).

## Methodology

The total emissions are derived from the amount of `gas` used for each transaction.
See https://carbon.fyi/learn for a brief intro and link to more in-depth explainers.
