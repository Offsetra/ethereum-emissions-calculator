# Ethereum Carbon Emissions Calculator

Made with ♥ by [Offsetra.com](https://offsetra.com/about) for [carbon.fyi](https://carbon.fyi).

License: MIT.

Please cite Offsetra if you use this in your project, we really appreciate it! 🙏

Questions, comments, forks and PRs all very much appreciated!

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

console.log(emissions);
// {
//   transactionType: "eth",
//   kgCO2: 12345,
//   transactionsCount: 69,
//   gasUsed: 420,
// }
```

### calculateContractEmissions

The only difference between this method and `calculateAddressEmissions`, is that this method will also calculate and add emissions from _incoming_ transactions.
We have included this method at the request of platforms who are interested in calculating the collective impact of their contract, however for most cases we think `calculateAddressEmissions` makes more sense (to avoid double-counting the same emissions-- sender takes responsibility!)

```typescript
import { calculateContractEmissions } from "ethereum-emissions-calculator";
import { address, etherscanAPIKey } from "data";

const emissions = await calculateContractEmissions({
  transactionType: "eth", // "eth" | "erc20" | "erc721"
  address, // 0x12345[...]
  etherscanAPIKey,
});

console.log(emissions);
// {
//   transactionType: "eth",
//   kgCO2: 12345,
//   transactionsCount: 69,
//   gasUsed: 420,
// }
```

## Methodology

The total emissions are derived from the amount of `gas` used for each transaction.
See https://carbon.fyi/learn for a brief intro and link to more in-depth explainers.

We would like to integrate the actuall carbon accounting methodology and hash-rate calculations into this repository at some point in the near future. Let us know if you'd like to put in a PR to help us along!
