# Ethereum Carbon Emissions Calculator

Made with ♥ by [Offsetra.com](https://offsetra.com/about) for [carbon.fyi](https://carbon.fyi).
Questions, comments, forks and PRs all very much appreciated!

License: **NON-COMMERCIAL USE ONLY**. Creative Commons BY-NC-SA.
To request a commercial-use license contact support@offsetra.com.

The total emissions are derived from the amount of `gas` used for each transaction.
See https://carbon.fyi/learn

The emission table needs periodic updating to track the most recent chain usage. Download .csv gas used data from https://etherscan.io/chart/gasused and hashrate data from https://etherscan.io/chart/hashrate
To generate up-to-date emission data run:
```
node src/data/generateEmissionsTable.js
```

