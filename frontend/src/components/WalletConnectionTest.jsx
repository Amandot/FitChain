import React, { useState, useEffect } from 'react';
import SimpleWalletConnect from './SimpleWalletConnect';
import './WalletConnectionTest.css';

const WalletConnectionTest = () => {
    const [testResults, setTestResults] = useState({
        walletDetected: false,
        connectionWorking: false,
        lastTest: null,
        error: null
    });
    const [connectedWallet, setConnectedWallet] = useState(null);

    useEffect(() => {
        runConnectionTest();
    }, []);

    const runConnectionTest = async () => {
        const results = {
            walletDetected: false,
            connectionWorking: false,
            lastTest: new Date().toLocaleTimeString(),
            error: null
        };

        try {
            // Test 1: Check if wallet is installed
            results.walletDetected = !!window.freighter;
            
            if (results.walletDetected) {
                // Test 2: Check if connection works
                try {
                    const isAllowed = await window.freighter.isAllowed();
                    if (isAllowed) {
                        const publicKey = await window.freighter.getPublicKey();
                        if (publicKey) {
                            results.connectionWorking = true;
                        }
                    }
                } catch (error) {
                    results.error = `Connection test failed: ${error.message}`;
                }
            } else {
                results.error = 'No wallet extension found';
            }
        } catch (error) {
            results.error = `Test failed: ${error.message}`;
        }

        setTestResults(results);
    };

    const handleWalletConnect = (walletInfo) => {
        setConnectedWallet(walletInfo);
        runConnectionTest();
    };

    const handleWalletDisconnect = () => {
        setConnectedWallet(null);
        runConnectionTest();
    };

    return (
        <div className="wallet-connection-test">
            <div className="test-header">
                <h3>🔧 Wallet Connection Test</h3>
                <button onClick={runConnectionTest} className="refresh-test-btn">
                    🔄 Refresh Test
                </button>
            </div>

            {/* Test Results */}
            <div className="test-results">
                <div className={`test-item ${testResults.walletDetected ? 'success' : 'error'}`}>
                    <span className="test-icon">
                        {testResults.walletDetected ? '✅' : '❌'}
                    </span>
                    <span>Wallet Extension: {testResults.walletDetected ? 'Detected' : 'Not Found'}</span>
                </div>

                <div className={`test-item ${testResults.connectionWorking ? 'success' : 'warning'}`}>
                    <span className="test-icon">
                        {testResults.connectionWorking ? '✅' : '⚠️'}
                    </span>
                    <span>Connection: {testResults.connectionWorking ? 'Working' : 'Not Connected'}</span>
                </div>

                {testResults.error && (
                    <div className="test-item error">
                        <span className="test-icon">❌</span>
                        <span>Error: {testResults.error}</span>
                    </div>
                )}

                <div className="test-item info">
                    <span className="test-icon">🕒</span>
                    <span>Last Test: {testResults.lastTest}</span>
                </div>
            </div>

            {/* Connection Component */}
            <div className="connection-section">
                <h4>💼 Wallet Connection</h4>
                <SimpleWalletConnect
                    onWalletConnect={handleWalletConnect}
                    onWalletDisconnect={handleWalletDisconnect}
                />
            </div>

            {/* Connected Wallet Info */}
            {connectedWallet && (
                <div className="connected-info">
                    <h4>✅ Connection Successful!</h4>
                    <div className="wallet-details">
                        <div className="detail-row">
                            <span>Public Key:</span>
                            <span className="mono">{connectedWallet.publicKey}</span>
                        </div>
                        <div className="detail-row">
                            <span>Short Address:</span>
                            <span className="mono">
                                {connectedWallet.publicKey.slice(0, 6)}...{connectedWallet.publicKey.slice(-4)}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span>Network:</span>
                            <span>{connectedWallet.network}</span>
                        </div>
                        <div className="detail-row">
                            <span>Wallet Type:</span>
                            <span>{connectedWallet.walletType}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="quick-actions">
                <h4>🚀 Quick Actions</h4>
                <div className="action-buttons">
                    {!testResults.walletDetected && (
                        <button 
                            onClick={() => window.open('https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk', '_blank')}
                            className="action-btn install"
                        >
                            📥 Install Wallet
                        </button>
                    )}
                    
                    <button 
                        onClick={() => window.open('http://localhost:5173', '_blank')}
                        className="action-btn main-app"
                    >
                        🎯 Open Main App
                    </button>
                    
                    <button 
                        onClick={() => window.open('/wallet-connection-fix.html', '_blank')}
                        className="action-btn diagnostic"
                    >
                        🔧 Full Diagnostic
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalletConnectionTest;