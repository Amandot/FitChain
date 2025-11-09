import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../App';
import './NavigationDemo.css';

const NavigationDemo = () => {
  const wallet = useWallet();
  const [currentDemo, setCurrentDemo] = useState('home');

  const demoPages = {
    home: {
      title: '🏠 Home Page',
      content: 'This is the home page. Navigate seamlessly without URL changes!',
      color: '#3b82f6'
    },
    profile: {
      title: '👤 Profile Page', 
      content: 'Your profile page with persistent wallet connection.',
      color: '#10b981'
    },
    settings: {
      title: '⚙️ Settings Page',
      content: 'Settings page - wallet stays connected across all pages.',
      color: '#f59e0b'
    }
  };

  return (
    <div className="navigation-demo">
      {/* Navigation Bar */}
      <nav className="demo-nav">
        <div className="demo-nav-content">
          <h2>🚀 Navigation Demo</h2>
          
          <div className="demo-nav-buttons">
            {Object.entries(demoPages).map(([key, page]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentDemo(key)}
                className={`demo-nav-btn ${currentDemo === key ? 'active' : ''}`}
                style={{ '--accent-color': page.color }}
              >
                {page.title}
              </motion.button>
            ))}
          </div>

          {/* Wallet Status */}
          <div className="demo-wallet-status">
            {wallet.isConnected ? (
              <div className="wallet-connected">
                <span className="status-dot"></span>
                <span>Connected: {wallet.formatAddress(wallet.walletAddress)}</span>
              </div>
            ) : (
              <div className="wallet-disconnected">
                <span>No wallet connected</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="demo-content">
        <motion.div
          key={currentDemo}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="demo-page"
          style={{ '--page-color': demoPages[currentDemo].color }}
        >
          <h1>{demoPages[currentDemo].title}</h1>
          <p>{demoPages[currentDemo].content}</p>
          
          <div className="demo-features">
            <div className="feature-card">
              <h3>✨ Seamless Navigation</h3>
              <p>No URL changes, instant page transitions</p>
            </div>
            
            <div className="feature-card">
              <h3>🔗 Persistent Connection</h3>
              <p>Wallet stays connected across all pages</p>
            </div>
            
            <div className="feature-card">
              <h3>⚡ Fast Performance</h3>
              <p>No page reloads, smooth animations</p>
            </div>
          </div>

          {wallet.isConnected && (
            <div className="connection-info">
              <h3>🚀 Wallet Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Address:</span>
                  <span className="value">{wallet.walletAddress}</span>
                </div>
                <div className="info-item">
                  <span className="label">Network:</span>
                  <span className="value">{wallet.stellarNetwork?.network || 'testnet'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className="value connected">Connected</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NavigationDemo;