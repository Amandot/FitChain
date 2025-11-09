import React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../App';
import StellarWalletConnect from './StellarWalletConnect';
import './GlobalNavigation.css';

const GlobalNavigation = ({ 
  currentPage, 
  onNavigate, 
  showBackButton = true,
  title,
  subtitle 
}) => {
  const wallet = useWallet();

  const getBackDestination = () => {
    if (currentPage === 'landing') return null;
    if (currentPage === 'app') return 'landing';
    return 'app'; // contests, leaderboard, contest-leaderboard go back to app
  };

  const getBackLabel = () => {
    const destination = getBackDestination();
    if (!destination) return null;
    
    switch (destination) {
      case 'landing': return '← Back to Landing';
      case 'app': return '← Back to App';
      default: return '← Back';
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="global-navigation glass"
    >
      <div className="nav-content">
        {/* Left side - Back button and title */}
        <div className="nav-left">
          {showBackButton && getBackDestination() && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(getBackDestination())}
              className="nav-back-button"
            >
              {getBackLabel()}
            </motion.button>
          )}
          
          {title && (
            <div className="nav-title-section">
              <h1 className="nav-title">{title}</h1>
              {subtitle && <p className="nav-subtitle">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Right side - Wallet connection */}
        <div className="nav-right">
          <div className="wallet-status">
            {wallet.isConnected && (
              <div className="connection-indicator">
                <span className="status-dot connected"></span>
                <span className="status-text">Connected</span>
              </div>
            )}
            
            <StellarWalletConnect
              onWalletConnect={wallet.onConnect}
              onWalletDisconnect={wallet.onDisconnect}
            />
          </div>
        </div>
      </div>

      {/* Connection status bar */}
      {wallet.isConnected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="connection-status-bar"
        >
          <div className="status-content">
            <span className="wallet-icon">🚀</span>
            <span className="wallet-info">
              Freighter: {wallet.formatAddress(wallet.walletAddress)}
            </span>
            <span className="network-info">
              {wallet.stellarNetwork?.network || 'testnet'}
            </span>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default GlobalNavigation;