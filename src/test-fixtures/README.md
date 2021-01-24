# Useful real-world wallets

## 0xe51b6569c10936d2127db72124441b72ad178b98

39txns, trading cryptokitties
https://etherscan.io/token/0x06012c8cf97bead5deae237070f9587f8e7a266d?a=0xe51b6569c10936d2127db72124441b72ad178b98

# normal-transactions.json

Data copy-pasted from API docs:

- Get a list of 'Normal' Transactions By Address
- [Optional Parameters] startblock: starting blockNo to retrieve results, endblock: ending blockNo to retrieve results
  https://api.etherscan.io/api?module=account&action=txlist&address=0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKeyToken

# internal-transactions.json

It seems that these all have 0 gasUsed
_When two smart contracts "interact,'' the product or consequence of this interaction is a transaction. However, that transaction does not exist on the ETH blockchain. They are value transfers that were initiated by executing a smart contract (smart contract Ether or token transfer)._

- Get a list of 'Internal' Transactions by Address
  https://api.etherscan.io/api?module=account&action=txlistinternal&address=0x2c1ba59d6f58433fb1eaee7d20b26ed83bda51a3&startblock=0&endblock=2702578&sort=asc&apikey=YourApiKeyToken

# erc20-transfer-events.json

Fungible

- Get a list of "ERC20 - Token Transfer Events" by Address
  https://api.etherscan.io/api?module=account&action=tokentx&address=0x4e83362442b8d1bec281594cea3050c8eb01311c&startblock=0&endblock=999999999&sort=asc&apikey=YourApiKeyToken

# erc721-token-transfer-events.json

Non-fungible

- Get a list of "ERC721 - Token Transfer Events" by Address
  https://api.etherscan.io/api?module=account&action=tokennfttx&address=0x6975be450864c02b4613023c2152ee0743572325&startblock=0&endblock=999999999&sort=asc&apikey=YourApiKeyToken
