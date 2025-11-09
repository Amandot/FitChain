import React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../App';
import './NavigationInstructions.css';

const NavigationInstructions = ({ onClose }) => {
  const wallet = useWallet();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="navigation-instructions-overlay"
    >
      <div className="instructions-modal">
        <div className="modal-header">
          <h2>🚀 Seamless Navigation Guide</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="modal-content">
          <div className="instruction-section">
            <h3>✨ Key Features</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">🔗</span>
                <div>
                  <h4>No URL Changes</h4>
                  <p>Navigate between pages instantly without browser URL changes</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">🚀</span>
                <div>
                  <h4>Persistent Wallet</h4>
                  <p>Your Freighter wallet stays connected across all pages</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <div>
                  <h4>Instant Transitions</h4>
                  <p>Smooth animations with no loading delays</p>
                </div>
              </div>
            </div>
          </div>

          <div className="instruction-section">
            <h3>🎯 How to Navigate</h3>
            <div className="navigation-methods">
              <div className="method">
                <h4>1. Top Navigation Bar</h4>
                <p>Use the navigation buttons in the header of each page</p>
              </div>
              
              <div className="method">
                <h4>2. Floating Action Button</h4>
                <p>Click the ⚡ button in the bottom-right corner for quick access</p>
              </div>
              
              <div className="method">
                <h4>3. Landing Page Menu</h4>
                <p>Use the main navigation menu on the landing page</p>
              </div>
            </div>
          </div>

          <div className="instruction-section">
            <h3>🔌 Wallet Connection</h3>
            <div className="wallet-info">
              {wallet.isConnected ? (
                <div className="connected-status">
                  <span className="status-indicator connected">✅</span>
                  <div>
                    <h4>Wallet Connected</h4>
                    <p>Address: {wallet.formatAddress(wallet.walletAddress)}</p>
                    <p>Network: {wallet.stellarNetwork?.network || 'testnet'}</p>
                  </div>
                </div>
              ) : (
                <div className="disconnected-status">
                  <span className="status-indicator disconnected">🔌</span>
                  <div>
                    <h4>No Wallet Connected</h4>
                    <p>Connect your Freighter wallet to access all features</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="instruction-section">
            <h3>📱 Available Pages</h3>
            <div className="pages-grid">
              <div className="page-item">
                <span className="page-icon">🏠</span>
                <div>
                  <h4>Landing Page</h4>
                  <p>Main introduction and navigation hub</p>
                </div>
              </div>
              
              <div className="page-item">
                <span className="page-icon">🏃‍♂️</span>
                <div>
                  <h4>Fitness App</h4>
                  <p>GPS tracking and workout recording</p>
                </div>
              </div>
              
              <div className="page-item">
                <span className="page-icon">🏆</span>
                <div>
                  <h4>Contests</h4>
                  <p>Join fitness competitions and challenges</p>
                </div>
              </div>
              
              <div className="page-item">
                <span className="page-icon">📊</span>
                <div>
                  <h4>Leaderboard</h4>
                  <p>View global fitness rankings</p>
                </div>
              </div>
              
              <div className="page-item">
                <span className="page-icon">👑</span>
                <div>
                  <h4>Champions</h4>
                  <p>Contest winners and achievements</p>
                </div>
              </div>
              
              <div className="page-item">
                <span className="page-icon">🎯</span>
                <div>
                  <h4>Navigation Demo</h4>
                  <p>Interactive demonstration of features</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="got-it-btn">
            Got it! Let's Navigate 🚀
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NavigationInstructions;