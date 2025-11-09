import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FreighterDiagnostic.css';

const FreighterDiagnostic = ({ isVisible, onClose }) => {
  const [diagnostics, setDiagnostics] = useState({
    freighterDetected: false,
    isAllowed: false,
    publicKey: null,
    network: null,
    error: null,
    lastCheck: null
  });
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isVisible) {
      runDiagnostics();
    }
  }, [isVisible]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results = {
      freighterDetected: false,
      isAllowed: false,
      publicKey: null,
      network: null,
      error: null,
      lastCheck: new Date().toLocaleTimeString()
    };

    try {
      // Check if Freighter is available
      results.freighterDetected = !!window.freighter;
      
      if (results.freighterDetected) {
        // Check permissions
        try {
          results.isAllowed = await window.freighter.isAllowed();
          
          if (results.isAllowed) {
            // Get public key
            results.publicKey = await window.freighter.getPublicKey();
            
            // Get network
            results.network = await window.freighter.getNetwork();
          }
        } catch (error) {
          results.error = error.message;
        }
      } else {
        results.error = 'Freighter extension not found';
      }
    } catch (error) {
      results.error = error.message;
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  const connectFreighter = async () => {
    try {
      if (!window.freighter) {
        alert('Please install Freighter wallet extension first');
        window.open('https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk', '_blank');
        return;
      }

      await window.freighter.requestAccess();
      runDiagnostics();
    } catch (error) {
      console.error('Connection failed:', error);
      runDiagnostics();
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="diagnostic-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="diagnostic-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="diagnostic-header">
            <h3>🔍 Stellar Wallet Diagnostic</h3>
            <button onClick={onClose} className="close-btn">✕</button>
          </div>

          <div className="diagnostic-content">
            <div className="diagnostic-section">
              <h4>System Status</h4>
              <div className="status-grid">
                <div className={`status-item ${diagnostics.freighterDetected ? 'success' : 'error'}`}>
                  <span className="status-icon">
                    {diagnostics.freighterDetected ? '✅' : '❌'}
                  </span>
                  <span>Wallet Extension</span>
                  <span className="status-value">
                    {diagnostics.freighterDetected ? 'Detected' : 'Not Found'}
                  </span>
                </div>

                <div className={`status-item ${diagnostics.isAllowed ? 'success' : 'warning'}`}>
                  <span className="status-icon">
                    {diagnostics.isAllowed ? '✅' : '⚠️'}
                  </span>
                  <span>Permission Status</span>
                  <span className="status-value">
                    {diagnostics.isAllowed ? 'Granted' : 'Not Granted'}
                  </span>
                </div>

                <div className={`status-item ${diagnostics.publicKey ? 'success' : 'warning'}`}>
                  <span className="status-icon">
                    {diagnostics.publicKey ? '✅' : '⚠️'}
                  </span>
                  <span>Wallet Account</span>
                  <span className="status-value">
                    {diagnostics.publicKey ? 'Available' : 'None'}
                  </span>
                </div>

                <div className={`status-item ${diagnostics.network ? 'success' : 'info'}`}>
                  <span className="status-icon">
                    {diagnostics.network ? '🌐' : 'ℹ️'}
                  </span>
                  <span>Network</span>
                  <span className="status-value">
                    {diagnostics.network || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {diagnostics.publicKey && (
              <div className="diagnostic-section">
                <h4>Wallet Information</h4>
                <div className="wallet-details">
                  <div className="detail-item">
                    <span className="detail-label">Public Key:</span>
                    <span className="detail-value">{diagnostics.publicKey}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Short Address:</span>
                    <span className="detail-value">
                      {diagnostics.publicKey.slice(0, 6)}...{diagnostics.publicKey.slice(-4)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Network:</span>
                    <span className="detail-value">{diagnostics.network}</span>
                  </div>
                </div>
              </div>
            )}

            {diagnostics.error && (
              <div className="diagnostic-section">
                <h4>Error Details</h4>
                <div className="error-details">
                  {diagnostics.error}
                </div>
              </div>
            )}

            <div className="diagnostic-section">
              <h4>Troubleshooting</h4>
              <div className="troubleshooting-steps">
                {!diagnostics.freighterDetected && (
                  <div className="step">
                    <span className="step-number">1</span>
                    <div className="step-content">
                      <strong>Install Stellar Wallet</strong>
                      <p>Download and install from the Chrome Web Store</p>
                      <button 
                        onClick={() => window.open('https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk', '_blank')}
                        className="action-btn"
                      >
                        Get Wallet
                      </button>
                    </div>
                  </div>
                )}

                {diagnostics.freighterDetected && !diagnostics.isAllowed && (
                  <div className="step">
                    <span className="step-number">2</span>
                    <div className="step-content">
                      <strong>Connect to Wallet</strong>
                      <p>Grant permission to access your wallet</p>
                      <button onClick={connectFreighter} className="action-btn">
                        Connect Wallet
                      </button>
                    </div>
                  </div>
                )}

                {diagnostics.freighterDetected && diagnostics.isAllowed && !diagnostics.publicKey && (
                  <div className="step">
                    <span className="step-number">3</span>
                    <div className="step-content">
                      <strong>Create or Import Account</strong>
                      <p>You need a Stellar account in your wallet</p>
                      <button 
                        onClick={() => window.open('https://freighter.app/', '_blank')}
                        className="action-btn"
                      >
                        Open Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="diagnostic-footer">
            <div className="last-check">
              Last check: {diagnostics.lastCheck}
            </div>
            <div className="diagnostic-actions">
              <button 
                onClick={runDiagnostics} 
                disabled={isRunning}
                className="refresh-btn"
              >
                {isRunning ? '🔄 Checking...' : '🔄 Refresh'}
              </button>
              <button onClick={onClose} className="close-btn-footer">
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FreighterDiagnostic;