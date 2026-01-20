function HowToUse({ onNavigateHome }) {
  const steps = [
    {
      number: '01',
      title: 'Define Your Function',
      description: 'Choose between two input modes: paste the full ABI JSON from Etherscan or your project artifacts, or use the simpler Function Interface format by typing the signature directly.',
      example: `{
  "type": "function",
  "name": "transfer",
  "inputs": [
    { "name": "to", "type": "address" },
    { "name": "amount", "type": "uint256" }
  ],
  "outputs": [{ "name": "", "type": "bool" }],
  "stateMutability": "nonpayable"
}`,
      interfaceExample: 'function transfer(address to, uint256 amount) returns (bool)',
      tips: [
        'ABI JSON: Full format from Etherscan or build artifacts',
        'Function Interface: Simple signature like "function name(type arg) view returns (type)"',
        'Use modifiers: view, pure, payable for state mutability',
      ],
    },
    {
      number: '02',
      title: 'Enter Parameters',
      description: 'Fill in the contract address and any function arguments. The app automatically detects parameter types and provides appropriate input hints.',
      tips: [
        'Contract address must be a valid 0x... address with deployed code',
        'TxForge will verify the contract exists on the network',
        'For arrays, use JSON format: ["value1", "value2"]',
        'Boolean values: type "true" or "false"',
        'For payable functions, enter ETH value to send',
      ],
    },
    {
      number: '03',
      title: 'Read or Execute',
      description: 'The app detects whether your function is read-only (view/pure) or write. Read functions can be called without a wallet. Write functions require wallet connection.',
      features: [
        { icon: '👁️', label: 'Read', desc: 'For view/pure functions - free, no gas, no wallet needed' },
        { icon: '🧪', label: 'Simulate', desc: 'Test write functions without spending gas' },
        { icon: '🚀', label: 'Send', desc: 'Execute the transaction on-chain' },
      ],
    },
  ]

  const supportedChains = [
    { name: 'Ethereum', icon: '⟠' },
    { name: 'Polygon', icon: '⬡' },
    { name: 'Arbitrum', icon: '🔵' },
    { name: 'Optimism', icon: '🔴' },
    { name: 'Base', icon: '🔷' },
    { name: 'Celo', icon: '🟡' },
  ]

  const exampleAbis = [
    {
      name: 'ERC20 Transfer',
      mutability: 'nonpayable',
      abi: `{"type":"function","name":"transfer","inputs":[{"name":"to","type":"address"},{"name":"amount","type":"uint256"}],"outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable"}`,
    },
    {
      name: 'ERC20 Balance',
      mutability: 'view',
      abi: `{"type":"function","name":"balanceOf","inputs":[{"name":"account","type":"address"}],"outputs":[{"name":"","type":"uint256"}],"stateMutability":"view"}`,
    },
    {
      name: 'ERC721 Approve',
      mutability: 'nonpayable',
      abi: `{"type":"function","name":"approve","inputs":[{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"outputs":[],"stateMutability":"nonpayable"}`,
    },
    {
      name: 'Uniswap Quote',
      mutability: 'view',
      abi: `{"type":"function","name":"quoteExactInputSingle","inputs":[{"name":"tokenIn","type":"address"},{"name":"tokenOut","type":"address"},{"name":"fee","type":"uint24"},{"name":"amountIn","type":"uint256"},{"name":"sqrtPriceLimitX96","type":"uint160"}],"outputs":[{"name":"amountOut","type":"uint256"}],"stateMutability":"view"}`,
    },
  ]

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="how-to-use-container">
      <header className="header">
        <div className="logo" onClick={onNavigateHome} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>TxForge</h1>
        </div>
        <nav className="nav-links">
          <button className="nav-link" onClick={onNavigateHome}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to App
          </button>
        </nav>
      </header>

      <main className="how-to-main">
        <div className="hero-section">
          <div className="hero-badge">Documentation</div>
          <h1 className="hero-title">How to Use TxForge</h1>
          <p className="hero-subtitle">
            A simple guide to interacting with any smart contract function
          </p>
        </div>

        <div className="steps-section">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-header">
                <span className="step-number">{step.number}</span>
                <h2 className="step-title">{step.title}</h2>
              </div>
              <p className="step-description">{step.description}</p>
              
              {step.example && (
                <div className="code-examples-dual">
                  <div className="code-example">
                    <div className="code-header">
                      <span>ABI JSON</span>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(step.example)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Copy
                      </button>
                    </div>
                    <pre>{step.example}</pre>
                  </div>
                  
                  {step.interfaceExample && (
                    <div className="code-example interface-example">
                      <div className="code-header">
                        <span>Function Interface</span>
                        <button 
                          className="copy-btn"
                          onClick={() => copyToClipboard(step.interfaceExample)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Copy
                        </button>
                      </div>
                      <pre>{step.interfaceExample}</pre>
                      <div className="interface-note">
                        <span className="interface-badge">Simpler!</span>
                        Just type the function signature
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step.tips && (
                <div className="tips-list">
                  <h4>Tips:</h4>
                  <ul>
                    {step.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {step.features && (
                <div className="features-grid">
                  {step.features.map((feature, i) => (
                    <div key={i} className="feature-card">
                      <span className="feature-icon">{feature.icon}</span>
                      <span className="feature-label">{feature.label}</span>
                      <span className="feature-desc">{feature.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="examples-section">
          <h2 className="section-title">
            <span className="title-icon">📋</span>
            Example ABIs
          </h2>
          <p className="section-subtitle">Click to copy and try these common function ABIs</p>
          
          <div className="examples-grid">
            {exampleAbis.map((example, index) => (
              <button 
                key={index} 
                className="example-card"
                onClick={() => copyToClipboard(example.abi)}
              >
                <div className="example-header">
                  <span className="example-name">{example.name}</span>
                  <span className={`example-mutability ${example.mutability === 'view' ? 'read' : ''}`}>
                    {example.mutability}
                  </span>
                </div>
                <div className="example-action">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Copy ABI
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="chains-section">
          <h2 className="section-title">
            <span className="title-icon">⛓️</span>
            Supported Chains
          </h2>
          <div className="chains-grid">
            {supportedChains.map((chain, index) => (
              <div key={index} className="chain-badge">
                <span className="chain-icon">{chain.icon}</span>
                <span className="chain-name">{chain.name}</span>
              </div>
            ))}
          </div>
          <p className="chains-note">+ Testnets: Sepolia, Goerli, Amoy, and more</p>
        </div>

        <div className="tips-section">
          <h2 className="section-title">
            <span className="title-icon">💡</span>
            Pro Tips
          </h2>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">🔍</div>
              <h3>Finding ABIs</h3>
              <p>Go to Etherscan → Contract → Code tab → scroll to "Contract ABI". Copy individual functions from the array.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">🧪</div>
              <h3>Always Simulate First</h3>
              <p>Before sending a transaction, use Simulate to verify it won't revert and check the estimated gas cost.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">👁️</div>
              <h3>Read Functions are Free</h3>
              <p>View and pure functions don't require gas or a wallet. Use them to check contract state anytime.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">📊</div>
              <h3>Check Return Values</h3>
              <p>Simulations show return values. For functions like `approve`, check that it returns `true`.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">⚠️</div>
              <h3>Contract Validation</h3>
              <p>TxForge automatically checks if contracts exist at the provided address. You'll get clear errors for invalid or undeployed contracts.</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <h2>Ready to interact with smart contracts?</h2>
          <button className="cta-button" onClick={onNavigateHome}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Launch TxForge
          </button>
        </div>
      </main>

      <footer className="footer">
        <p>Built for EVM chains • Simulate before you send</p>
        <p className="copyright">© {new Date().getFullYear()} TxForge. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default HowToUse
