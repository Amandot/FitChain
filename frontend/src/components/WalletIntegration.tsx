import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Wallet from './Wallet';
import { walletPaymentService, PaymentRequest } from '../services/walletPayment';
import './WalletIntegration.css';

interface WalletIntegrationProps {
  onWalletConnect?: (walletInfo: any) => void;
  onWalletDisconnect?: () => void;
  onPaymentComplete?: (paymentResult: any) => void;
}

const WalletIntegration: React.FC<WalletIntegrationProps> = ({
  onWalletConnect,
  onWalletDisconnect,
  onPaymentComplete
}) => {
  const [walletState, setWalletState] = useState({
    isConnected: false,
    address: '',
    isConnecting: false,
    error: null as string | null
  });

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);

  // Check wallet connection on component mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (window.freighter) {
        const isAllowed = await window.freighter.isAllowed();
        if (isAllowed) {
          const publicKey = await window.freighter.getPublicKey();
          if (publicKey) {
            setWalletState({
              isConnected: true,
              address: publicKey,
              isConnecting: false,
              error: null
            });

            if (onWalletConnect) {
              onWalletConnect({
                publicKey,
                walletType: 'freighter',
                isConnected: true
              });
            }

            addNotification('success', 'Wallet connected successfully');
          }
        }
      }
    } catch (error) {
      console.error('Wallet connection check failed:', error);
    }
  };

  const handleWalletConnect = async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      if (!window.freighter) {
        throw new Error('Freighter wallet not installed');
      }

      await window.freighter.requestAccess();
      const isAllowed = await window.freighter.isAllowed();

      if (!isAllowed) {
        throw new Error('Wallet connection was rejected');
      }

      const publicKey = await window.freighter.getPublicKey();
      if (!publicKey) {
        throw new Error('Unable to get wallet address');
      }

      setWalletState({
        isConnected: true,
        address: publicKey,
        isConnecting: false,
        error: null
      });

      if (onWalletConnect) {
        onWalletConnect({
          publicKey,
          walletType: 'freighter',
          isConnected: true
        });
      }

      addNotification('success', 'Wallet connected successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage
      }));

      addNotification('error', errorMessage);
    }
  };

  const handleWalletDisconnect = () => {
    setWalletState({
      isConnected: false,
      address: '',
      isConnecting: false,
      error: null
    });

    if (onWalletDisconnect) {
      onWalletDisconnect();
    }

    addNotification('info', 'Wallet disconnected');
  };

  const handlePayment = async (paymentData: any) => {
    try {
      addNotification('info', 'Processing payment...');

      const paymentRequest: PaymentRequest = {
        recipient: paymentData.recipient,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description
      };

      const result = await walletPaymentService.sendPayment(
        walletState.address,
        paymentRequest
      );

      if (result.success) {
        addNotification('success', `Payment sent successfully! TX: ${result.transactionHash?.slice(0, 10)}...`);
        
        if (onPaymentComplete) {
          onPaymentComplete(result);
        }
      } else {
        throw new Error(result.error || 'Payment failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      addNotification('error', errorMessage);
    }
  };

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="wallet-integration">
      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`notification ${notification.type}`}
            onClick={() => removeNotification(notification.id)}
          >
            <div className="notification-icon">
              {notification.type === 'success' ? '✅' :
               notification.type === 'error' ? '❌' : 'ℹ️'}
            </div>
            <div className="notification-content">
              <div className="notification-message">{notification.message}</div>
              <div className="notification-time">
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>
            <button className="notification-close">×</button>
          </motion.div>
        ))}
      </div>

      {/* Wallet Component */}
      <Wallet
        walletAddress={walletState.address}
        isConnected={walletState.isConnected}
        onConnect={handleWalletConnect}
        onDisconnect={handleWalletDisconnect}
        onPayment={handlePayment}
      />

      {/* Connection Status */}
      {walletState.error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="connection-error"
        >
          <div className="error-icon">⚠️</div>
          <div className="error-message">{walletState.error}</div>
          <button onClick={handleWalletConnect} className="retry-btn">
            🔄 Retry Connection
          </button>
        </motion.div>
      )}

      {/* Quick Actions */}
      {walletState.isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="quick-actions"
        >
          <h4>🚀 Quick Actions</h4>
          <div className="action-buttons">
            <button
              onClick={() => {
                // Add a demo received payment
                walletPaymentService.addReceivedPayment(
                  walletState.address,
                  25,
                  'XLM',
                  'GCKFBEIYTKP...DEMO',
                  'Demo fitness reward'
                );
                addNotification('success', 'Received 25 XLM fitness reward!');
              }}
              className="action-btn receive"
            >
              📥 Simulate Reward
            </button>
            
            <button
              onClick={() => {
                // Reset balances for demo
                walletPaymentService.resetBalances();
                addNotification('info', 'Balances reset for demo');
              }}
              className="action-btn reset"
            >
              🔄 Reset Demo
            </button>
            
            <button
              onClick={() => {
                // Clear payment history
                walletPaymentService.clearPaymentHistory();
                addNotification('info', 'Payment history cleared');
              }}
              className="action-btn clear"
            >
              🗑️ Clear History
            </button>
          </div>
        </motion.div>
      )}

      {/* Wallet Status Indicator */}
      <div className="wallet-status-indicator">
        <div className={`status-dot ${walletState.isConnected ? 'connected' : 'disconnected'}`}></div>
        <span className="status-text">
          {walletState.isConnecting ? 'Connecting...' :
           walletState.isConnected ? 'Wallet Connected' :
           'Wallet Disconnected'}
        </span>
      </div>
    </div>
  );
};

export default WalletIntegration;