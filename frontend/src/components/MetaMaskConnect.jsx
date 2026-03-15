import React, { useState, useEffect } from 'react';
import {
  connectMetaMask,
  getMetaMaskAccount,
  getMetaMaskChainId,
  getNetworkName,
  onAccountsChanged,
  onChainChanged,
} from '../utils/metamaskWallet';
import './MetaMaskConnect.css';

const MetaMaskConnect = ({ onConnect, onDisconnect }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  // Check reactively — MetaMask injects window.ethereum after page load
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Give MetaMask time to inject window.ethereum, then check
    const checkInstalled = () => {
      setInstalled(typeof window.ethereum !== 'undefined');
    };

    // Check immediately and again after a short delay
    checkInstalled();
    const t = setTimeout(checkInstalled, 500);

    // Auto-restore if already connected
    const init = async () => {
      try {
        const acc = await getMetaMaskAccount();
        if (acc) {
          const chain = await getMetaMaskChainId();
          const networkName = getNetworkName(chain);
          setAccount(acc);
          setChainId(chain);
          onConnect?.({ address: acc, chainId: chain, networkName, walletType: 'metamask' });
        }
      } catch (e) {
        // not connected yet, that's fine
      }
    };
    init();

    // React to account / chain changes from MetaMask
    const removeAccounts = onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setChainId(null);
        onDisconnect?.();
      } else {
        setAccount(accounts[0]);
        getMetaMaskChainId().then((chain) => {
          setChainId(chain);
          onConnect?.({ address: accounts[0], chainId: chain, networkName: getNetworkName(chain), walletType: 'metamask' });
        });
      }
    });

    const removeChain = onChainChanged((newChainId) => {
      setChainId(newChainId);
    });

    return () => {
      clearTimeout(t);
      removeAccounts();
      removeChain();
    };
  }, []);

  const handleConnect = async () => {
    if (!installed) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const acc = await connectMetaMask();
      const chain = await getMetaMaskChainId();
      const networkName = getNetworkName(chain);
      setAccount(acc);
      setChainId(chain);
      onConnect?.({ address: acc, chainId: chain, networkName, walletType: 'metamask' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAccount(null);
    setChainId(null);
    setError(null);
    onDisconnect?.();
  };

  if (account) {
    return (
      <div className="metamask-connected">
        <div className="metamask-info">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="metamask-fox" />
          <div className="metamask-details">
            <span className="metamask-label">MetaMask</span>
            <span className="metamask-address">{account.slice(0, 6)}...{account.slice(-4)}</span>
            <span className="metamask-network">{getNetworkName(chainId)}</span>
          </div>
        </div>
        <button className="metamask-disconnect-btn" onClick={handleDisconnect} title="Disconnect">✕</button>
      </div>
    );
  }

  return (
    <div className="metamask-disconnected">
      <button
        className={`metamask-connect-btn ${!installed ? 'install-mode' : ''}`}
        onClick={handleConnect}
        disabled={isConnecting}
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="metamask-fox-sm" />
        {isConnecting ? 'Connecting...' : installed ? 'Connect MetaMask' : 'Install MetaMask'}
      </button>
      {error && <div className="metamask-error">❌ {error}</div>}
    </div>
  );
};

export default MetaMaskConnect;
