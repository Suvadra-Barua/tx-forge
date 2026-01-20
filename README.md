# TxForge

A powerful EVM transaction toolkit built with React, RainbowKit, and Viem. Simulate, craft, and send transactions across multiple chains with advanced validation and gas analysis.

![TxForge](https://img.shields.io/badge/EVM-Compatible-brightgreen)
![TxForge](https://img.shields.io/badge/React-18+-blue)
![TxForge](https://img.shields.io/badge/Type-Safe-orange)

## ✨ Features

- 🔗 **Connect Wallet** - RainbowKit integration for seamless wallet connection
- 📝 **Dual Input Modes** - Paste ABI JSON or type function signatures directly
- 🧪 **Advanced Simulation** - Comprehensive gas analysis with balance checking
- 👁️ **Smart Read Functions** - Automatic detection of view/pure functions with free calls
- ⚠️ **Contract Validation** - Verifies contracts exist before simulation
- 💰 **Real-time Gas** - Live gas price tracking with cost calculations
- 🔄 **Refresh Controls** - Easy re-parsing and parameter clearing
- 📚 **Built-in Documentation** - Interactive "How to Use" guide
- 🌐 **Multi-chain Support** - Ethereum, Polygon, Optimism, Arbitrum, Base, Celo + testnets

## Getting Started

### Prerequisites

- Node.js 18+
- A wallet (MetaMask, etc.)

### Installation

```bash
npm install
```

### Configuration

1. Get a WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Update the `projectId` in `src/wagmi.js`:

```js
export const config = getDefaultConfig({
  appName: 'TxForge',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Replace this
  // ...
})
```

### Running

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🚀 Quick Start

1. **Connect Wallet** - Click "Connect Wallet" in the top-right
2. **Choose Input Mode** - Toggle between "ABI JSON" or "Function Interface"
3. **Enter Function** - Paste ABI or type signature like `function transfer(address to, uint256 amount) returns (bool)`
4. **Fill Parameters** - Enter contract address and function arguments
5. **Simulate First** - Always test before sending to check gas costs
6. **Send or Read** - Execute transaction or call view functions for free

## 🎨 What Makes TxForge Special

- **Dual Input Modes** - Choose between full ABI JSON or simple function signatures
- **Smart Function Detection** - Automatically handles read vs write functions differently
- **Real Gas Cost Analysis** - Shows actual costs, not just estimates
- **Contract Validation** - Prevents wasted gas on invalid addresses
- **Built-in Documentation** - No need to leave the app to learn how to use it
- **Beautiful UI** - Modern, responsive design with dark theme
- **Type-Safe** - Full TypeScript support for reliable operation

## 📖 Detailed Usage

### Input Methods

#### Method 1: ABI JSON (Full Format)
Paste complete ABI from Etherscan or build artifacts:

```json
{
  "type": "function",
  "name": "transfer",
  "inputs": [
    { "name": "to", "type": "address" },
    { "name": "amount", "type": "uint256" }
  ],
  "outputs": [{ "name": "", "type": "bool" }],
  "stateMutability": "nonpayable"
}
```

#### Method 2: Function Interface (Simple)
Just type the function signature:

```
function transfer(address to, uint256 amount) returns (bool)
function balanceOf(address account) view returns (uint256)
function approve(address spender, uint256 amount) external returns (bool)
```

### Smart Function Detection

TxForge automatically detects function types:

- **👁️ Read Functions** (view/pure): Free calls, no wallet needed, instant results
- **⚡ Write Functions** (payable/nonpayable): Require simulation, show gas analysis, need wallet for sending

### Advanced Gas Analysis

When simulating transactions, TxForge provides:

- **Gas Limit**: Base gas units needed
- **Safety Buffer**: 20% extra for reliability
- **Current Gas Price**: Live network pricing (updates every 30s)
- **Total Cost**: Actual fee in native token (ETH, MATIC, etc.)
- **Balance Check**: Warns if insufficient funds for gas

### Contract Validation

Before any operation, TxForge:
- ✅ Verifies contract exists at the address
- ✅ Confirms it's deployed on the current network
- ❌ Shows clear errors for invalid/undeployed contracts

## 🎯 Supported Input Types

TxForge handles all Solidity types with smart parsing:

| Type | Example Input | Notes |
|------|---------------|-------|
| `address` | `0x742d35Cc6634C0532925a3b844Bc9e7595f...` | Auto-validates checksum |
| `uint256` | `1000000000000000000` | BigInt conversion |
| `int256` | `-500` | Signed integer support |
| `bool` | `true` or `false` | Case-insensitive |
| `bytes` | `0x1234...` | Auto 0x prefix |
| `bytes32` | `0x1234...` | Fixed-size bytes |
| `string` | `Hello World` | UTF-8 support |
| Arrays | `["value1", "value2"]` or `value1, value2` | JSON or CSV format |
| Structs | `{"field": "value"}` | Nested object support |

## 🌐 Supported Networks

**Mainnets:**
- Ethereum (ETH)
- Polygon (MATIC)
- Optimism (OP)
- Arbitrum One (ARB)
- Base (ETH)
- Celo (CELO)

**Testnets:**
- Sepolia
- Goerli
- Amoy (Polygon)
- Arbitrum Sepolia
- Optimism Sepolia
- Base Sepolia
- Celo Alfajores

*All networks support real-time gas price tracking and automatic contract validation.*

## 🔧 Built-in Tools

### Documentation
- **Interactive Guide** - Click "How to Use" for step-by-step instructions
- **Example ABIs** - Copy common contract functions to try
- **Pro Tips** - Advanced usage patterns and best practices

### Developer Features
- **Type Safety** - Full TypeScript support with Viem
- **Error Handling** - Comprehensive validation and user feedback
- **Real-time Updates** - Live gas prices and network status
- **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

- **React 18** - Modern UI framework with hooks
- **Vite** - Lightning-fast build tool and dev server
- **RainbowKit** - Beautiful wallet connection UI
- **Wagmi** - Powerful React hooks for Ethereum
- **Viem** - Type-safe TypeScript interface for Ethereum
- **TanStack Query** - Robust async state management
- **CSS Variables** - Maintainable theming system

## 🤝 Contributing

Found a bug or have a feature request? Open an issue on GitHub!

## 📄 License

MIT License - feel free to use TxForge in your projects.
