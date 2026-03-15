// MetaMask Wallet Integration

export const isMetaMaskInstalled = () => {
  if (typeof window === 'undefined') return false;
  // window.ethereum exists — treat as MetaMask-compatible even if isMetaMask flag isn't set
  return typeof window.ethereum !== 'undefined';
};

export const connectMetaMask = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found in MetaMask');
    }
    return accounts[0];
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('Connection rejected by user');
    }
    throw error;
  }
};

export const getMetaMaskAccount = async () => {
  if (!isMetaMaskInstalled()) return null;
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
};

export const getMetaMaskChainId = async () => {
  if (!isMetaMaskInstalled()) return null;
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId;
  } catch {
    return null;
  }
};

export const getNetworkName = (chainId) => {
  const networks = {
    '0x1': 'Ethereum Mainnet',
    '0x5': 'Goerli Testnet',
    '0xaa36a7': 'Sepolia Testnet',
    '0x89': 'Polygon',
    '0x13881': 'Mumbai Testnet',
    '0xa': 'Optimism',
    '0xa4b1': 'Arbitrum One',
    '0x38': 'BNB Chain',
  };
  return networks[chainId] || `Chain ${chainId}`;
};

export const onAccountsChanged = (callback) => {
  if (!isMetaMaskInstalled()) return () => {};
  window.ethereum.on('accountsChanged', callback);
  return () => window.ethereum.removeListener('accountsChanged', callback);
};

export const onChainChanged = (callback) => {
  if (!isMetaMaskInstalled()) return () => {};
  window.ethereum.on('chainChanged', callback);
  return () => window.ethereum.removeListener('chainChanged', callback);
};
