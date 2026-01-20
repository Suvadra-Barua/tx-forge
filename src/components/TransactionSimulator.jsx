import { useState, useCallback, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { encodeFunctionData, decodeFunctionResult, formatEther } from 'viem'

function TransactionSimulator({ onNavigateToGuide }) {
  const { address, isConnected, chain } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [inputMode, setInputMode] = useState('abi') // 'abi' or 'interface'
  const [abiInput, setAbiInput] = useState('')
  const [interfaceInput, setInterfaceInput] = useState('')
  const [parsedFunction, setParsedFunction] = useState(null)
  const [contractAddress, setContractAddress] = useState('')
  const [inputValues, setInputValues] = useState({})
  const [ethValue, setEthValue] = useState('')
  const [parseError, setParseError] = useState('')
  const [simulationResult, setSimulationResult] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [currentGasPrice, setCurrentGasPrice] = useState(null)

  // Check if function is read-only (view or pure)
  const isReadFunction = parsedFunction?.stateMutability === 'view' || parsedFunction?.stateMutability === 'pure'

  // Fetch current gas price
  useEffect(() => {
    const fetchGasPrice = async () => {
      if (publicClient && chain) {
        try {
          const gasPrice = await publicClient.getGasPrice()
          setCurrentGasPrice(gasPrice)
        } catch (error) {
          // Ignore gas price fetch errors
        }
      }
    }

    fetchGasPrice()
    // Update gas price every 30 seconds
    const interval = setInterval(fetchGasPrice, 30000)
    return () => clearInterval(interval)
  }, [publicClient, chain])

  const parseABI = useCallback((input) => {
    setParseError('')
    setParsedFunction(null)
    setInputValues({})

    if (!input.trim()) return

    try {
      let parsed = JSON.parse(input)
      
      // Handle array of functions - take the first one
      if (Array.isArray(parsed)) {
        parsed = parsed[0]
      }

      // Validate it's a function
      if (parsed.type !== 'function') {
        setParseError('ABI must be a function type')
        return
      }

      setParsedFunction(parsed)
      
      // Initialize input values
      const initialValues = {}
      parsed.inputs?.forEach((input, index) => {
        initialValues[`${input.name || `arg${index}`}`] = ''
      })
      setInputValues(initialValues)
    } catch (e) {
      setParseError('Invalid JSON. Please enter a valid function ABI.')
    }
  }, [])

  // Parse function interface like: function transfer(address to, uint256 amount) returns (bool)
  const parseFunctionInterface = useCallback((input) => {
    setParseError('')
    setParsedFunction(null)
    setInputValues({})

    if (!input.trim()) return

    try {
      // Clean up the input
      let cleanInput = input.trim()
      
      // Remove 'function' keyword if present
      if (cleanInput.toLowerCase().startsWith('function ')) {
        cleanInput = cleanInput.substring(9).trim()
      }

      // Extract function name
      const nameMatch = cleanInput.match(/^(\w+)\s*\(/)
      if (!nameMatch) {
        setParseError('Could not parse function name. Format: functionName(type1 name1, type2 name2)')
        return
      }
      const functionName = nameMatch[1]

      // Extract parameters section
      const paramsMatch = cleanInput.match(/\(([^)]*)\)/)
      if (!paramsMatch) {
        setParseError('Could not parse parameters. Use format: (type1 name1, type2 name2)')
        return
      }
      const paramsStr = paramsMatch[1].trim()

      // Parse input parameters
      const inputs = []
      if (paramsStr) {
        const params = paramsStr.split(',').map(p => p.trim()).filter(p => p)
        for (let i = 0; i < params.length; i++) {
          const param = params[i]
          // Handle formats like: "address to", "uint256", "address", "uint256 amount"
          const parts = param.split(/\s+/).filter(p => p)
          if (parts.length === 0) continue
          
          let type = parts[0]
          let name = parts.length > 1 ? parts[parts.length - 1] : `arg${i}`
          
          // Handle indexed, memory, calldata, storage keywords
          const keywords = ['indexed', 'memory', 'calldata', 'storage']
          if (parts.length > 2) {
            type = parts[0]
            name = parts[parts.length - 1]
          }
          
          // Remove any keywords from the name
          if (keywords.includes(name.toLowerCase())) {
            name = `arg${i}`
          }
          
          inputs.push({ name, type, internalType: type })
        }
      }

      // Check for mutability keywords
      let stateMutability = 'nonpayable'
      const lowerInput = cleanInput.toLowerCase()
      if (lowerInput.includes(' view') || lowerInput.includes(' view ')) {
        stateMutability = 'view'
      } else if (lowerInput.includes(' pure') || lowerInput.includes(' pure ')) {
        stateMutability = 'pure'
      } else if (lowerInput.includes(' payable') && !lowerInput.includes('nonpayable')) {
        stateMutability = 'payable'
      }

      // Extract return types
      const outputs = []
      const returnsMatch = cleanInput.match(/returns\s*\(([^)]*)\)/i)
      if (returnsMatch) {
        const returnsStr = returnsMatch[1].trim()
        if (returnsStr) {
          const returnParams = returnsStr.split(',').map(p => p.trim()).filter(p => p)
          for (let i = 0; i < returnParams.length; i++) {
            const param = returnParams[i]
            const parts = param.split(/\s+/).filter(p => p)
            if (parts.length === 0) continue
            
            const type = parts[0]
            const name = parts.length > 1 ? parts[parts.length - 1] : ''
            
            outputs.push({ name, type, internalType: type })
          }
        }
      }

      const parsed = {
        type: 'function',
        name: functionName,
        inputs,
        outputs,
        stateMutability,
      }

      setParsedFunction(parsed)
      
      // Initialize input values
      const initialValues = {}
      inputs.forEach((input, index) => {
        initialValues[input.name || `arg${index}`] = ''
      })
      setInputValues(initialValues)
    } catch (e) {
      setParseError('Could not parse function interface. Check the format.')
    }
  }, [])

  const handleAbiChange = (e) => {
    const value = e.target.value
    setAbiInput(value)
    parseABI(value)
  }

  const handleInterfaceChange = (e) => {
    const value = e.target.value
    setInterfaceInput(value)
    parseFunctionInterface(value)
  }

  const switchInputMode = (mode) => {
    setInputMode(mode)
    setParseError('')
    setParsedFunction(null)
    setInputValues({})
    setSimulationResult(null)
    setTxHash('')
  }

  const handleInputChange = (name, value) => {
    setInputValues(prev => ({ ...prev, [name]: value }))
  }

  const parseInputValue = (value, type) => {
    if (type.includes('[]')) {
      try {
        return JSON.parse(value)
      } catch {
        return value.split(',').map(v => v.trim())
      }
    }
    if (type.startsWith('uint') || type.startsWith('int')) {
      return BigInt(value)
    }
    if (type === 'bool') {
      return value.toLowerCase() === 'true'
    }
    if (type.startsWith('bytes') && !type.includes('[]')) {
      return value.startsWith('0x') ? value : `0x${value}`
    }
    return value
  }

  const getInputArgs = () => {
    if (!parsedFunction?.inputs) return []
    return parsedFunction.inputs.map((input, index) => {
      const name = input.name || `arg${index}`
      const value = inputValues[name] || ''
      return parseInputValue(value, input.type)
    })
  }

  const simulateTransaction = async () => {
    if (!publicClient || !parsedFunction || !contractAddress) return

    setIsSimulating(true)
    setSimulationResult(null)
    setTxHash('')

    try {
      const args = getInputArgs()
      const data = encodeFunctionData({
        abi: [parsedFunction],
        functionName: parsedFunction.name,
        args,
      })

      const txParams = {
        account: address,
        to: contractAddress,
        data,
        value: ethValue ? BigInt(Math.floor(parseFloat(ethValue) * 1e18)) : BigInt(0),
      }

      // Get gas price and estimate gas
      const [gasEstimate, gasPrice] = await Promise.all([
        publicClient.estimateGas(txParams),
        publicClient.getGasPrice()
      ])

      // Add 20% buffer for safety (common practice)
      const gasLimitWithBuffer = BigInt(Math.floor(Number(gasEstimate) * 1.2))

      // Calculate total cost
      const totalGasCost = gasLimitWithBuffer * gasPrice

      // Simulate the call
      let returnData = null
      if (parsedFunction.outputs?.length > 0) {
        try {
          returnData = await publicClient.call(txParams)
          if (returnData.data) {
            returnData = decodeFunctionResult({
              abi: [parsedFunction],
              functionName: parsedFunction.name,
              data: returnData.data,
            })
          }
        } catch (callError) {
          // Call might revert but gas estimation passed
          returnData = { error: callError.message }
        }
      }

      // Check if user has enough balance for gas
      let gasWarning = null
      if (address) {
        try {
          const balance = await publicClient.getBalance({ address })
          if (totalGasCost > balance) {
            gasWarning = `Insufficient balance for gas. Need ${(Number(totalGasCost) / 1e18).toFixed(6)} ${chain?.nativeCurrency?.symbol || 'ETH'}, you have ${(Number(balance) / 1e18).toFixed(6)}`
          }
        } catch (balanceError) {
          // Ignore balance check errors
        }
      }

      setSimulationResult({
        success: true,
        gasEstimate: gasEstimate.toString(),
        gasLimitWithBuffer: gasLimitWithBuffer.toString(),
        gasPrice: gasPrice.toString(),
        totalGasCost: totalGasCost.toString(),
        gasWarning,
        returnData: returnData !== null ? JSON.stringify(returnData, (_, v) =>
          typeof v === 'bigint' ? v.toString() : v, 2) : null,
      })
    } catch (error) {
      let errorMessage = error.message
      
      // Try to extract revert reason
      if (error.cause?.reason) {
        errorMessage = error.cause.reason
      } else if (error.shortMessage) {
        errorMessage = error.shortMessage
      }

      setSimulationResult({
        success: false,
        error: errorMessage,
      })
    } finally {
      setIsSimulating(false)
    }
  }

  const sendTransaction = async () => {
    if (!walletClient || !parsedFunction || !contractAddress) return

    setIsSending(true)
    setSimulationResult(null)
    setTxHash('')

    try {
      const args = getInputArgs()
      const data = encodeFunctionData({
        abi: [parsedFunction],
        functionName: parsedFunction.name,
        args,
      })

      const hash = await walletClient.sendTransaction({
        to: contractAddress,
        data,
        value: ethValue ? BigInt(Math.floor(parseFloat(ethValue) * 1e18)) : BigInt(0),
      })

      setTxHash(hash)
      setSimulationResult({
        success: true,
        message: 'Transaction sent successfully!',
      })
    } catch (error) {
      setSimulationResult({
        success: false,
        error: error.message || 'Transaction failed',
      })
    } finally {
      setIsSending(false)
    }
  }

  const readContract = async () => {
    if (!publicClient || !parsedFunction || !contractAddress) return

    setIsReading(true)
    setSimulationResult(null)

    try {
      const args = getInputArgs()
      const data = encodeFunctionData({
        abi: [parsedFunction],
        functionName: parsedFunction.name,
        args,
      })

      const result = await publicClient.call({
        to: contractAddress,
        data,
      })

      let decodedResult = null
      if (result.data) {
        decodedResult = decodeFunctionResult({
          abi: [parsedFunction],
          functionName: parsedFunction.name,
          data: result.data,
        })
      }

      setSimulationResult({
        success: true,
        isRead: true,
        returnData: decodedResult !== null ? JSON.stringify(decodedResult, (_, v) => 
          typeof v === 'bigint' ? v.toString() : v, 2) : 'void',
      })
    } catch (error) {
      let errorMessage = error.message
      
      if (error.cause?.reason) {
        errorMessage = error.cause.reason
      } else if (error.shortMessage) {
        errorMessage = error.shortMessage
      }

      setSimulationResult({
        success: false,
        isRead: true,
        error: errorMessage,
      })
    } finally {
      setIsReading(false)
    }
  }

  const getInputPlaceholder = (type) => {
    if (type.includes('[]')) return 'e.g. ["value1", "value2"] or value1, value2'
    if (type.startsWith('address')) return '0x...'
    if (type.startsWith('uint') || type.startsWith('int')) return '0'
    if (type === 'bool') return 'true or false'
    if (type.startsWith('bytes')) return '0x...'
    return 'Enter value'
  }

  const clearAbi = () => {
    setAbiInput('')
    setInterfaceInput('')
    setParsedFunction(null)
    setInputValues({})
    setParseError('')
    setSimulationResult(null)
    setTxHash('')
  }

  const clearParameters = () => {
    setContractAddress('')
    setEthValue('')
    const clearedValues = {}
    parsedFunction?.inputs?.forEach((input, index) => {
      clearedValues[input.name || `arg${index}`] = ''
    })
    setInputValues(clearedValues)
    setSimulationResult(null)
    setTxHash('')
  }

  const refreshAbi = () => {
    if (inputMode === 'abi') {
      if (!abiInput.trim()) return
      parseABI(abiInput)
    } else {
      if (!interfaceInput.trim()) return
      parseFunctionInterface(interfaceInput)
    }
    setSimulationResult(null)
    setTxHash('')
  }
  
  const currentInput = inputMode === 'abi' ? abiInput : interfaceInput

  const refreshParameters = () => {
    const clearedValues = {}
    parsedFunction?.inputs?.forEach((input, index) => {
      clearedValues[input.name || `arg${index}`] = ''
    })
    setInputValues(clearedValues)
    setSimulationResult(null)
    setTxHash('')
  }

  const getExplorerUrl = () => {
    if (!chain || !txHash) return null
    const explorers = {
      // Mainnets
      1: 'https://etherscan.io',
      137: 'https://polygonscan.com',
      10: 'https://optimistic.etherscan.io',
      42161: 'https://arbiscan.io',
      8453: 'https://basescan.org',
      42220: 'https://celoscan.io',
      // Testnets
      11155111: 'https://sepolia.etherscan.io',
      5: 'https://goerli.etherscan.io',
      80002: 'https://amoy.polygonscan.com',
      421614: 'https://sepolia.arbiscan.io',
      11155420: 'https://sepolia-optimism.etherscan.io',
      84532: 'https://sepolia.basescan.org',
      44787: 'https://alfajores.celoscan.io',
    }
    const baseUrl = explorers[chain.id] || ''
    return baseUrl ? `${baseUrl}/tx/${txHash}` : null
  }

  return (
    <div className="simulator-container">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>TxForge</h1>
        </div>
        <div className="header-right">
          {currentGasPrice && chain && (
            <div className="gas-price-display">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {(Number(currentGasPrice) / 1e9).toFixed(2)} gwei
            </div>
          )}
          <button className="nav-link" onClick={onNavigateToGuide}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            How to Use
          </button>
          <ConnectButton />
        </div>
      </header>

      <main className="main-content">
        <section className="abi-section">
          <div className="section-header">
            <span className="section-number">01</span>
            <h2>Function Definition</h2>
            <button 
              className="btn-icon btn-icon-refresh" 
              onClick={refreshAbi}
              title="Refresh"
              disabled={!currentInput}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="btn-icon" 
              onClick={clearAbi}
              title="Clear"
              disabled={!currentInput}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="input-mode-toggle">
            <button 
              className={`mode-btn ${inputMode === 'abi' ? 'active' : ''}`}
              onClick={() => switchInputMode('abi')}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              ABI JSON
            </button>
            <button 
              className={`mode-btn ${inputMode === 'interface' ? 'active' : ''}`}
              onClick={() => switchInputMode('interface')}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Function Interface
            </button>
          </div>

          <div className="input-group">
            {inputMode === 'abi' ? (
              <textarea
                value={abiInput}
                onChange={handleAbiChange}
                placeholder='Paste function ABI JSON here, e.g.:
{
  "type": "function",
  "name": "transfer",
  "inputs": [
    { "name": "to", "type": "address" },
    { "name": "amount", "type": "uint256" }
  ],
  "outputs": [{ "name": "", "type": "bool" }],
  "stateMutability": "nonpayable"
}'
                className="abi-input"
                spellCheck="false"
              />
            ) : (
              <textarea
                value={interfaceInput}
                onChange={handleInterfaceChange}
                placeholder='Enter function signature, e.g.:

function transfer(address to, uint256 amount) returns (bool)

function balanceOf(address account) view returns (uint256)

function approve(address spender, uint256 amount) external returns (bool)

Modifiers: view, pure, payable'
                className="abi-input interface-input"
                spellCheck="false"
              />
            )}
            {parseError && <div className="error-message">{parseError}</div>}
          </div>
        </section>

        {parsedFunction && (
          <>
            <section className="params-section">
              <div className="section-header">
                <span className="section-number">02</span>
                <h2>Parameters</h2>
                <button 
                  className="btn-icon btn-icon-refresh" 
                  onClick={refreshParameters}
                  title="Refresh Parameters"
                  disabled={Object.values(inputValues).every(v => !v)}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button 
                  className="btn-icon" 
                  onClick={clearParameters}
                  title="Clear Parameters"
                  disabled={!contractAddress && Object.values(inputValues).every(v => !v)}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <div className={`function-badge ${isReadFunction ? 'read-only' : ''}`}>
                <span className="function-name">{parsedFunction.name}</span>
                <span className={`function-mutability ${isReadFunction ? 'read-only' : ''}`}>
                  {parsedFunction.stateMutability}
                </span>
                {isReadFunction && (
                  <span className="read-indicator">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    READ ONLY
                  </span>
                )}
              </div>
              
              {isReadFunction && parsedFunction.outputs?.length > 0 && (
                <div className="return-types">
                  <span className="return-label">Returns</span>
                  <div className="return-types-list">
                    {parsedFunction.outputs.map((output, index) => (
                      <span key={index} className="return-type-badge">
                        {output.name && <span className="return-name">{output.name}:</span>}
                        <span className="return-type">{output.type}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="params-grid">
                <div className="input-group">
                  <label>Contract Address</label>
                  <input
                    type="text"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="0x..."
                    className="text-input"
                  />
                </div>

                {parsedFunction.stateMutability === 'payable' && (
                  <div className="input-group">
                    <label>ETH Value</label>
                    <input
                      type="text"
                      value={ethValue}
                      onChange={(e) => setEthValue(e.target.value)}
                      placeholder="0.0"
                      className="text-input"
                    />
                  </div>
                )}

                {parsedFunction.inputs?.map((input, index) => {
                  const name = input.name || `arg${index}`
                  return (
                    <div key={index} className="input-group">
                      <label>
                        {name}
                        <span className="type-badge">{input.type}</span>
                      </label>
                      <input
                        type="text"
                        value={inputValues[name] || ''}
                        onChange={(e) => handleInputChange(name, e.target.value)}
                        placeholder={getInputPlaceholder(input.type)}
                        className="text-input"
                      />
                    </div>
                  )
                })}
              </div>
            </section>

            <section className={`actions-section ${isReadFunction ? 'read-mode' : ''}`}>
              <div className="section-header">
                <span className={`section-number ${isReadFunction ? 'read-mode' : ''}`}>03</span>
                <h2>{isReadFunction ? 'Read Contract' : 'Execute'}</h2>
              </div>
              
              {isReadFunction ? (
                <>
                  <div className="read-info">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>This is a read-only function. No transaction will be sent to the blockchain.</span>
                  </div>
                  
                  <div className="button-group">
                    <button
                      onClick={readContract}
                      disabled={!publicClient || !contractAddress || isReading}
                      className="btn btn-read"
                    >
                      {isReading ? (
                        <>
                          <span className="spinner read"></span>
                          Reading...
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Read
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="read-note">
                    <span>No wallet required</span>
                    <span className="dot">•</span>
                    <span>Free to call</span>
                    <span className="dot">•</span>
                    <span>No gas fees</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="button-group">
                    <button
                      onClick={simulateTransaction}
                      disabled={!isConnected || !contractAddress || isSimulating || isSending}
                      className="btn btn-simulate"
                    >
                      {isSimulating ? (
                        <>
                          <span className="spinner"></span>
                          Simulating...
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Simulate
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={sendTransaction}
                      disabled={!isConnected || !contractAddress || isSimulating || isSending}
                      className="btn btn-send"
                    >
                      {isSending ? (
                        <>
                          <span className="spinner"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Send
                        </>
                      )}
                    </button>
                  </div>

                  {!isConnected && (
                    <div className="warning-message">
                      Connect your wallet to simulate or send transactions
                    </div>
                  )}
                </>
              )}
            </section>

            {(simulationResult || txHash) && (
              <section className={`result-section ${simulationResult?.isRead ? 'read-mode' : ''}`}>
                <div className="section-header">
                  <span className={`section-number ${simulationResult?.isRead ? 'read-mode' : ''}`}>04</span>
                  <h2>{simulationResult?.isRead ? 'Read Result' : 'Result'}</h2>
                </div>
                
                <div className={`result-card ${simulationResult?.success ? (simulationResult?.isRead ? 'read' : 'success') : 'error'}`}>
                  {simulationResult?.success ? (
                    <>
                      <div className={`result-icon ${simulationResult?.isRead ? 'read' : 'success'}`}>
                        {simulationResult?.isRead ? (
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="result-content">
                        <h3>
                          {simulationResult?.isRead 
                            ? 'Contract Read Successful' 
                            : (txHash ? 'Transaction Sent!' : 'Simulation Successful')
                          }
                        </h3>
                        {!simulationResult?.isRead && simulationResult.gasEstimate && (
                          <div className="gas-breakdown">
                            <div className="gas-header">
                              <span className="gas-title">Gas Analysis</span>
                              {simulationResult.gasWarning && (
                                <div className="gas-warning">
                                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                  </svg>
                                  {simulationResult.gasWarning}
                                </div>
                              )}
                            </div>
                            <div className="gas-items">
                              <div className="gas-item">
                                <span className="gas-label">Gas Limit:</span>
                                <span className="gas-value">{parseInt(simulationResult.gasEstimate).toLocaleString()}</span>
                              </div>
                              <div className="gas-item">
                                <span className="gas-label">With Buffer (20%):</span>
                                <span className="gas-value">{parseInt(simulationResult.gasLimitWithBuffer || simulationResult.gasEstimate).toLocaleString()}</span>
                              </div>
                              <div className="gas-item">
                                <span className="gas-label">Gas Price:</span>
                                <span className="gas-value">{(Number(simulationResult.gasPrice) / 1e9).toFixed(2)} gwei</span>
                              </div>
                              <div className="gas-item total">
                                <span className="gas-label">Total Cost:</span>
                                <span className="gas-value">{(Number(simulationResult.totalGasCost) / 1e18).toFixed(6)} {chain?.nativeCurrency?.symbol || 'ETH'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {simulationResult.returnData && (
                          <div className="result-item">
                            <span className="label">{simulationResult?.isRead ? 'Value:' : 'Return Value:'}</span>
                            <pre className={`value code ${simulationResult?.isRead ? 'read-value' : ''}`}>{simulationResult.returnData}</pre>
                          </div>
                        )}
                        {txHash && (
                          <div className="result-item">
                            <span className="label">Transaction Hash:</span>
                            <div className="tx-hash">
                              <code>{txHash}</code>
                              {getExplorerUrl() && (
                                <a href={getExplorerUrl()} target="_blank" rel="noopener noreferrer" className="explorer-link">
                                  View on Explorer →
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="result-icon error">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="result-content">
                        <h3>{simulationResult?.isRead ? 'Read Failed' : 'Transaction Failed'}</h3>
                        <div className="error-details">
                          <pre>{simulationResult?.error}</pre>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <p>Built for EVM chains • Simulate before you send</p>
        <p className="copyright">© {new Date().getFullYear()} TxForge. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default TransactionSimulator
