import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Wallet.css';

interface WalletPayment {
  id: string;
  amount: number;
  currency: string;
  recipient: string;
  sender: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  type: 'send' | 'receive';
  description?: string;
  transactionHash?: string;
}

interface WalletBalance {
  currency: string;
  amount: number;
  usdValue: number;
}

interface WalletProps {
  walletAddress?: string;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onPayment: (payment: Omit<WalletPayment, 'id' | 'timestamp' | 'status'>) => void;
}

const Wallet: React.FC<WalletProps> = ({
  walletAddress,
  isConnected,
  onConnect,
  onDisconnect,
  onPayment
}) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'payments' | 'send'>('balance');
  const [payments, setPayments] = useState<WalletPayment[]>([]);
  const [balances, setBalances] = useState<WalletBalance[]>([
    { currency: 'XLM', amount: 1250.75, usdValue: 156.34 },
    { currency: 'USDC', amount: 500.00, usdValue: 500.00 },
    { currency: 'BTC', amount: 0.025, usdValue: 1087.50 }
  ]);
  const [sendForm, setSendForm] = useState({
    recipient: '',
    amount: '',
    currency: 'XLM',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mock payment data
  useEffect(() => {
    const mockPayments: WalletPayment[] = [
      {
        id: '1',
        amount: 100,
        currency: 'XLM',
        recipient: 'GCKFBEIYTKP...XLMN',
        sender: walletAddress || 'GCKFBEIYTKP...SELF',
        timestamp: new Date(Date.now() - 3600000),
        status: 'completed',
        type: 'send',
        description: 'Fitness reward payment',
        transactionHash: '0x1234...abcd'
      },
      {
        id: '2',
        amount: 50,
        currency: 'XLM',
        recipient: walletAddress || 'GCKFBEIYTKP...SELF',
        sender: 'GCKFBEIYTKP...SENDER',
        timestamp: new Date(Date.now() - 7200000),
        status: 'completed',
        type: 'receive',
        description: 'Contest prize',
        transactionHash: '0x5678...efgh'
      },
      {
        id: '3',
        amount: 25,
        currency: 'USDC',
        recipient: 'GCKFBEIYTKP...USDC',
        sender: walletAddress || 'GCKFBEIYTKP...SELF',
        timestamp: new Date(Date.now() - 10800000),
        status: 'pending',
        type: 'send',
        description: 'App subscription'
      }
    ];
    setPayments(mockPayments);
  }, [walletAddress]);

  const handleSendPayment = async () => {
    if (!sendForm.recipient || !sendForm.amount) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const newPayment: WalletPayment = {
        id: Date.now().toString(),
        amount: parseFloat(sendForm.amount),
        currency: sendForm.currency,
        recipient: sendForm.recipient,
        sender: walletAddress || 'Unknown',
        timestamp: new Date(),
        status: 'pending',
        type: 'send',
        description: sendForm.description || 'Payment'
      };

      // Add to payments list
      setPayments(prev => [newPayment, ...prev]);

      // Simulate payment processing
      setTimeout(() => {
        setPayments(prev => 
          prev.map(p => 
            p.id === newPayment.id 
              ? { ...p, status: 'completed' as const, transactionHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}` }
              : p
          )
        );

        // Update balance
        setBalances(prev => 
          prev.map(b => 
            b.currency === sendForm.currency 
              ? { ...b, amount: b.amount - parseFloat(sendForm.amount) }
              : b
          )
        );
      }, 3000);

      // Call parent callback
      onPayment(newPayment);

      // Reset form
      setSendForm({
        recipient: '',
        amount: '',
        currency: 'XLM',
        description: ''
      });

      // Switch to payments tab
      setActiveTab('payments');

    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toFixed(currency === 'BTC' ? 6 : 2)} ${currency}`;
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (!isConnected) {
    return (
      <div className="wallet-container">
        <div className="wallet-connect-prompt">
          <div className="connect-icon">💼</div>
          <h2>Connect Your Wallet</h2>
          <p>Connect your Stellar wallet to view balances and make payments</p>
          <button onClick={onConnect} className="connect-wallet-btn">
            🚀 Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <div className="wallet-info">
          <div className="wallet-icon">💼</div>
          <div className="wallet-details">
            <h2>Stellar Wallet</h2>
            <p className="wallet-address">{formatAddress(walletAddress || '')}</p>
          </div>
        </div>
        <button onClick={onDisconnect} className="disconnect-btn">
          🔌 Disconnect
        </button>
      </div>

      <div className="wallet-tabs">
        <button 
          className={`tab-btn ${activeTab === 'balance' ? 'active' : ''}`}
          onClick={() => setActiveTab('balance')}
        >
          💰 Balance
        </button>
        <button 
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          📋 Payments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'send' ? 'active' : ''}`}
          onClick={() => setActiveTab('send')}
        >
          💸 Send
        </button>
      </div>

      <div className="wallet-content">
        <AnimatePresence mode="wait">
          {activeTab === 'balance' && (
            <motion.div
              key="balance"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="balance-tab"
            >
              <h3>💰 Wallet Balances</h3>
              <div className="balances-grid">
                {balances.map((balance, index) => (
                  <motion.div
                    key={balance.currency}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="balance-card"
                  >
                    <div className="balance-currency">{balance.currency}</div>
                    <div className="balance-amount">{formatAmount(balance.amount, balance.currency)}</div>
                    <div className="balance-usd">${balance.usdValue.toFixed(2)} USD</div>
                  </motion.div>
                ))}
              </div>
              
              <div className="total-balance">
                <h4>Total Portfolio Value</h4>
                <div className="total-amount">
                  ${balances.reduce((sum, b) => sum + b.usdValue, 0).toFixed(2)} USD
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="payments-tab"
            >
              <h3>📋 Payment History</h3>
              <div className="payments-list">
                {payments.length === 0 ? (
                  <div className="no-payments">
                    <div className="no-payments-icon">📭</div>
                    <p>No payments yet</p>
                  </div>
                ) : (
                  payments.map((payment, index) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`payment-item ${payment.type}`}
                    >
                      <div className="payment-icon">
                        {payment.type === 'send' ? '📤' : '📥'}
                      </div>
                      <div className="payment-details">
                        <div className="payment-description">
                          {payment.description || 'Payment'}
                        </div>
                        <div className="payment-address">
                          {payment.type === 'send' ? 'To: ' : 'From: '}
                          {formatAddress(payment.type === 'send' ? payment.recipient : payment.sender)}
                        </div>
                        <div className="payment-timestamp">
                          {formatTimestamp(payment.timestamp)}
                        </div>
                      </div>
                      <div className="payment-amount">
                        <div className={`amount ${payment.type}`}>
                          {payment.type === 'send' ? '-' : '+'}
                          {formatAmount(payment.amount, payment.currency)}
                        </div>
                        <div 
                          className="payment-status"
                          style={{ color: getStatusColor(payment.status) }}
                        >
                          {payment.status}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'send' && (
            <motion.div
              key="send"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="send-tab"
            >
              <h3>💸 Send Payment</h3>
              <div className="send-form">
                <div className="form-group">
                  <label>Recipient Address</label>
                  <input
                    type="text"
                    placeholder="GCKFBEIYTKP...XLMN"
                    value={sendForm.recipient}
                    onChange={(e) => setSendForm(prev => ({ ...prev, recipient: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={sendForm.amount}
                      onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      value={sendForm.currency}
                      onChange={(e) => setSendForm(prev => ({ ...prev, currency: e.target.value }))}
                      className="form-select"
                    >
                      {balances.map(balance => (
                        <option key={balance.currency} value={balance.currency}>
                          {balance.currency}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Payment description"
                    value={sendForm.description}
                    onChange={(e) => setSendForm(prev => ({ ...prev, description: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="available-balance">
                  Available: {formatAmount(
                    balances.find(b => b.currency === sendForm.currency)?.amount || 0,
                    sendForm.currency
                  )}
                </div>

                <button
                  onClick={handleSendPayment}
                  disabled={isLoading || !sendForm.recipient || !sendForm.amount}
                  className="send-payment-btn"
                >
                  {isLoading ? '🔄 Processing...' : '💸 Send Payment'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wallet;