# Ethereum Carbon Emissions Calculator

Made with ♥ by [Offsetra.com](https://offsetra.com/about) for [carbon.fyi](https://carbon.fyi).

License: MIT.

Please cite Offsetra if you use this in your project, we really appreciate it! 🙏

# Description

JavaScript utility to calculate the CO2 emissions of any Ethereum address.

The tool is written in TypeScript and powered by the the Etherscan.io API & an open-source carbon accounting methodology under development by Offsetra.
We hope this tool is useful for raising awareness and understanding with regards to the rapidly growing carbon emissions of cryptocurrency mining.

Questions, comments, forks and PRs all very much appreciated!



## Usage

```
npm install ethereum-emissions-calculator
```

Provide an address and a transaction type, and the calculator will tell you how many emissions this represents in KG CO2e.
To calculate the sum total of your addresses' lifetime emissions, you must combine the sum of `eth`, `erc20`, and `erc721` emissions.

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
//   kgCO2: 12345`,
//   transactionsCount: 69,
//   gasUsed: 420,
// }
```

## Methodology

Emissions are calculated based on the transactions initiated (sent) by the provided address.
The total emissions are derived from the amount of `gas` used for each transaction.

More on this coming soon!
