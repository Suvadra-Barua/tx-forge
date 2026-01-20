import { useState } from 'react'
import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmi'
import TransactionSimulator from './components/TransactionSimulator'
import HowToUse from './components/HowToUse'

const queryClient = new QueryClient()

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#00ff9d',
            accentColorForeground: '#0a0f1c',
            borderRadius: 'medium',
          })}
        >
          <div className="app">
            {currentPage === 'home' ? (
              <TransactionSimulator onNavigateToGuide={() => setCurrentPage('guide')} />
            ) : (
              <HowToUse onNavigateHome={() => setCurrentPage('home')} />
            )}
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
