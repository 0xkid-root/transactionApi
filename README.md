# XDC Blockchain Transaction Analyzer

A collection of Node.js scripts for analyzing XDC blockchain transactions, including native XDC transfers and ERC-20 token transactions (USDT, USDC).

## Overview

This project provides multiple utilities to fetch and analyze blockchain transaction data from the XDC network. It includes scripts for:

- Fetching all transactions for a specific address
- Analyzing ERC-20 token transfers (USDT, USDC)
- Combining native XDC and token transaction data
- Detailed transaction categorization
- Approve transaction detection

## Prerequisites

- Node.js (v12 or higher)
- npm or yarn package manager

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Project Structure

```
.
├── bothXDCAndUSDTUSDC.js         # Combines native XDC and token transactions
├── fetchAllTxs.js                # Fetches all transactions using RPC calls
├── fetchUsdtUSDC.js              # Fetches only USDT and USDC token transactions
├── fetchrecentAllTran.js         # Fetches recent XDC transactions
├── mergedTokenSymbol.js          # Advanced transaction categorization
├── specifictransaction.js        # Fetches details of a specific transaction
├── testingINApprove.js           # Testing approve transaction detection
└── README.md
```

## Scripts Description

### 1. `fetchAllTxs.js`
Analyzes all transactions for an address using direct RPC calls to the XDC network.
- Fetches both normal and internal transactions
- Processes ERC-20 transfer events
- Calculates transaction fees
- Displays formatted transaction history

### 2. `fetchUsdtUSDC.js`
Fetches only USDT and USDC token transactions using the Etherscan API.
- Filters transactions for specific token contracts
- Displays token transfer details in a table format

### 3. `bothXDCAndUSDTUSDC.js`
Combines native XDC transactions with USDT/USDC token transactions.
- Merges data from multiple API endpoints
- Deduplicates transactions
- Displays unified transaction history

### 4. `mergedTokenSymbol.js`
Advanced transaction analyzer with improved categorization.
- Classifies transactions (Send, Receive, Approve, Contract Interaction)
- Handles both native XDC and token transactions
- Provides detailed transaction information

### 5. `testingINApprove.js`
Specialized script for detecting and categorizing approve transactions.
- Identifies approve function calls in transaction data
- Categorizes transactions with improved logic

### 6. `fetchrecentAllTran.js`
Fetches the most recent XDC transactions for an address.
- Simple script for quick transaction lookup

### 7. `specifictransaction.js`
Retrieves detailed information for a specific transaction hash.
- Shows complete transaction object
- Displays transaction receipt

## Configuration

Before running the scripts, you may need to update the following configuration values:

1. **Wallet Address**: Update the wallet address in each script:
   ```javascript
   const address = "0x496a824C5F766b00a6eeBe4328eB8526Adfb7c5f";
   ```

2. **API Key**: Update the Etherscan API key in scripts that use it:
   ```javascript
   const apiKey = "YOUR_ETHERSCAN_API_KEY";
   ```

3. **RPC Endpoint**: For scripts using direct RPC calls, you can modify the endpoint:
   ```javascript
   const RPC_URL = "https://rpc.apothem.network";  // XDC testnet
   ```

## Usage

Run any script using Node.js:

```bash
node fetchAllTxs.js
node fetchUsdtUSDC.js
node bothXDCAndUSDTUSDC.js
node mergedTokenSymbol.js
node testingINApprove.js
node fetchrecentAllTran.js
node specifictransaction.js
```

## Dependencies

- [ethers.js](https://docs.ethers.io/) - For interacting with the Ethereum/XDC blockchain
- [node-fetch](https://www.npmjs.com/package/node-fetch) - For making HTTP requests

## Network Information

- **Chain ID**: 51 (XDC Testnet)
- **RPC Endpoint**: https://rpc.apothem.network
- **Block Explorer**: https://apothem.xdcscan.io/

## Token Contracts

- **USDC**: 0x06F61AaaDd4cA4ba71154b323170dc5A07D6F403
- **USDT**: 0x6174129A416bCbb78c68ce933d2D41069B6f0f80

## Output Examples

The scripts provide formatted console output, typically displaying:
- Transaction hash
- Token symbol (XDC, USDC, USDT)
- Sender and receiver addresses
- Transaction value
- Timestamp
- Transaction type/category
- Gas fees (for RPC-based scripts)

## Notes

- The project is configured for the XDC Testnet (Apothem)
- To use with XDC Mainnet, update the chain ID to 50 and RPC endpoint
- API keys may have rate limits; check Etherscan documentation for details
- Some scripts use Etherscan API v2, which may require a paid subscription for heavy usage

## Troubleshooting

1. **API Key Issues**: Ensure your Etherscan API key is valid and has sufficient credits
2. **Network Connectivity**: Check that you can reach the RPC endpoint
3. **Address Format**: Make sure wallet addresses are in checksum format when required
4. **Node.js Version**: Ensure you're using a compatible Node.js version

## Contributing

Feel free to fork this repository and submit pull requests with improvements or additional features.

## License

This project is open source and available under the MIT License.