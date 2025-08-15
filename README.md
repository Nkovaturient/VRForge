# VRF Interface - Randomness Solidity Demo

<img width="1309" height="541" alt="Screenshot (647)" src="https://github.com/user-attachments/assets/43948c95-067f-4361-a54f-46b1bc68c48d" />

A modern, user-friendly interface for showcasing the MockRandomnessReceiver smart contract from the randomness-solidity library. This platform demonstrates how to interact with verifiable randomness from the dcipher threshold network.

## Features

<img width="1315" height="569" alt="Screenshot (648)" src="https://github.com/user-attachments/assets/b61cd42a-40df-4df7-84cd-72314da238d8" />
<br/>


- **Live Demo**: Interactive interface to test all contract functionalities
- **Contract Information**: Comprehensive overview of contract features and security
- **Wallet Integration**: Seamless wallet connection with RainbowKit
- **Real-time Updates**: Live contract state monitoring
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
---

## What It Demonstrates

<img width="1319" height="606" alt="Screenshot (646)" src="https://github.com/user-attachments/assets/2b6f00c3-418f-4a55-911d-70f54f3c98be" />

<br />

The interface showcases all the key functionalities of the MockRandomnessReceiver contract:

1. **Direct Funding Randomness**: Request randomness by paying per request
2. **Subscription Management**: Create and manage subscriptions for cost-effective randomness
3. **Real-time State Monitoring**: View contract state including randomness, request IDs, and subscriptions
4. **Transaction Handling**: Complete workflow from request to fulfillment

---

### Deployed Smart Contract Address: 0x96EE446A832b7AdcF598C4B2340131f622677c25
- [BaseSepolia Testnet](https://sepolia.basescan.org/address/0x96EE446A832b7AdcF598C4B2340131f622677c25)
 
---

## Prerequisites

Before running this interface, you need:

1. **Deployed MockRandomnessReceiver Contract**: The smart contract must be deployed on either of the supported Networks: [See Here](https://docs.randa.mu/networks/randomness/)

2. **Wallet with Test ETH**: Sufficient ETH for gas fees and randomness requests.
- [Filecoin Calibration Faucets](https://faucet.calibnet.chainsafe-fil.io/funds.html)
- [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)

3. **Environment Variables**: Set up your [Alchemy API key](https://dashboard.alchemy.com/) and [WalletConnect project ID](https://docs.reown.com/cloud/relay)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_api_key_here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

### 3. Update Contract Configuration

Edit `src/config.ts` and update:

```typescript
// Replace with your deployed contract address
export const CONTRACT_ADDRESS = '0xYourDeployedContractAddress';

// Update with your WalletConnect project ID
export const config = getDefaultConfig({
  appName: 'VRF Interface',
  projectId: 'YOUR_ACTUAL_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [baseSepolia], // deployed network
  ssr: true,
  transports: {
    [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`)
} // based on the deployed network, id and get url from alchemy dashboard
});
```

### 4. Run the Development Server

```bash
npm run dev
```

- Open [http://localhost:3000](http://localhost:3000) to view the interface.

---

## Usage Guide

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the header
2. Choose your preferred wallet (MetaMask, WalletConnect, etc.)
3. Ensure you're connected to supported networks like Base Sepolia testnet/FilecoinCalinet

### Testing Direct Funding

1. Navigate to the "Live Demo" tab
2. Click "Request Randomness (Direct Funding)"
3. Confirm the transaction in your wallet
4. Wait for the oracle to fulfill your request (may take several minutes sometimes :)

### Testing Subscription Model

1. Click "Create Subscription"
2. Once created, you can request randomness using the subscription

### Monitoring Contract State

The interface provides real-time updates of:
- Current randomness value
- Latest request ID
- Subscription status
- Contract owner
- Randomness sender address

## Architecture

```
src/
├── app/                    # Next.js app directory
|     |__ ranime/
|         |__ page.tsx        # anime character generator using the randomness val
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main page component
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── Header.tsx         # Navigation header
│   ├── RandomnessDemo.tsx # Main demo interface
│   └── ContractInfo.tsx   # Contract information display
├── config.ts              # Contract ABI and configuration
├── providers.tsx          # React Query and Wagmi providers
└── wagmi-config.ts        # Wagmi configuration
```

## Key Technologies

- **Next.js 15**: React framework with app router
- **Tailwind CSS**: Utility-first CSS framework
- **Wagmi**: React hooks for Ethereum
- **RainbowKit**: Wallet connection UI
- **React Query**: Data fetching and state management
- **randomness-js**: JavaScript SDK for randomness-solidity
- **ethers.js**: Ethereum library for interactions

## Contract Functions Demonstrated

### Read Functions
- `randomness`: Get current randomness value
- `requestId`: Get latest request ID
- `subscriptionId`: Get subscription ID
- `owner`: Get contract owner
- `randomnessSender`: Get randomness sender address

### Write Functions
- `rollDiceWithDirectFunding`: Request randomness with direct payment
- `rollDiceWithSubscription`: Request randomness using subscription

## Security Features

- **Verifiable Randomness**: All randomness comes from the cryptographically secure dcipher network
- **Access Control**: Only designated randomness sender can provide values
- **Request Validation**: Request IDs are validated for proper callback handling
- **Owner Controls**: Critical functions restricted to contract owner

## Troubleshooting

### Common Issues

1. **Contract Not Found**: Ensure the contract address is correct and deployed
2. **Transaction Fails**: Check you have sufficient ETH for gas and randomness fees
3. **Randomness Not Received**: Oracle fulfillment may take several minutes
4. **Wallet Connection Issues**: Ensure you're on the correct network

### Debug Mode

Enable console logging to debug issues:
- Check browser console for error messages
- Verify contract calls in your wallet
- Monitor transaction status on Base Sepolia explorer

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

- **Documentation**: [randomness-solidity docs](https://docs.randa.mu/)
- **GitHub**: [randomness-solidity repository](https://github.com/randa-mu/randomness-solidity)
- **Issues**: Report bugs or request features in this repository


Built randomly ❤️ using randomness-solidity and modern web technologies.🙂😄
