import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  celo,
  // Testnets
  sepolia,
  goerli,
  celoAlfajores,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
} from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'TxForge',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get one at https://cloud.walletconnect.com
  chains: [
    // Mainnets
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    celo,
    // Testnets
    sepolia,
    goerli,
    celoAlfajores,
    baseSepolia,
    arbitrumSepolia,
    optimismSepolia,
    polygonAmoy,
  ],
  ssr: false,
})
