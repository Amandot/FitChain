import React, { useState, useEffect } from 'react';
import { connectWallet, isWalletInstalled, getAddress } from '../utils/stellarWallet';
import './SimpleWalletConnect.css';

const SimpleWalletConnect = ({ onWalletConnect, onWalletDisconnect }) => {
    const [walletState, setWalletState] = useState({
        isInstalled: false,
        isConnected: false,
        isConnecting: false,
        publicKey: null,
        network: null,
        error: null
    });

    // Check wallet status
    useEffect(() => {
        checkWalletStatus();
        
        // Check every 3 seconds
        const interval = setInterval(checkWalletStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    const checkWalletStatus = async () => {
        try {
            const isInstalled = await isWalletInstalled();
            
            if (!isInstalled) {
                setWalletState(prev => ({
                    ...prev,
                    isInstalled: false,
                    isConnected: false,
                    error: null
                }));
                return;
            }

            // Check if already connected
            try {
                const result = await getAddress();
                
                if (!result.error && result.address) {
                    const publicKey = result.address;
                    setWalletState({
                        isInstalled: true,
                        isConnected: true,
                        isConnecting: false,
                        publicKey,
                        network: 'testnet', // Default network
                        error: null
                    });

                    // Notify parent component
                    if (onWalletConnect) {
                        onWalletConnect({
                            publicKey,
                            walletType: 'freighter',
                            network: 'testnet',
                            isConnected: true
                        });
                    }
                    return;
                }
            } catch (error) {
                // Not connected yet, that's fine
                console.log('Not connected yet:', error);
            }

            // Wallet installed but not connected
            setWalletState(prev => ({
                ...prev,
                isInstalled: true,
                isConnected: false,
                error: null
            }));

        } catch (error) {
            console.log('Wallet check error:', error);
            setWalletState(prev => ({
                ...prev,
                error: error.message
            }));
        }
    };

    const handleConnect = async () => {
        if (!walletState.isInstalled) {
            // Open installation page
            const install = confirm(
                'You need a Stellar wallet to connect.\n\n' +
                'Click OK to install Freighter wallet.'
            );
            
            if (install) {
                window.open('https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk', '_blank');
            }
            return;
        }

        setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            // Use the new connectWallet function
            const publicKey = await connectWallet();

            if (!publicKey) {
                throw new Error('Connection was rejected or no account found');
            }

            // Update state
            setWalletState({
                isInstalled: true,
                isConnected: true,
                isConnecting: false,
                publicKey,
                network: 'testnet',
                error: null
            });

            // Notify parent
            if (onWalletConnect) {
                onWalletConnect({
                    publicKey,
                    walletType: 'freighter',
                    network: 'testnet',
                    isConnected: true
                });
            }

        } catch (error) {
            console.error('Connection error:', error);
            
            let errorMessage = 'Connection failed';
            if (error.message && error.message.includes('rejected') || error.message.includes('declined')) {
                errorMessage = 'Connection was cancelled';
            } else if (error.message && error.message.includes('No account')) {
                errorMessage = 'No account found in wallet';
            }

            setWalletState(prev => ({
                ...prev,
                isConnecting: false,
                error: errorMessage
            }));
        }
    };

    const handleDisconnect = () => {
        setWalletState({
            isInstalled: walletState.isInstalled,
            isConnected: false,
            isConnecting: false,
            publicKey: null,
            network: null,
            error: null
        });

        if (onWalletDisconnect) {
            onWalletDisconnect();
        }
    };

    // Render connected state
    if (walletState.isConnected && walletState.publicKey) {
        return (
            <div className="simple-wallet-connected">
                <div className="wallet-info">
                    <div className="wallet-icon">🚀</div>
                    <div className="wallet-details">
                        <div className="wallet-label">Stellar Wallet</div>
                        <div className="wallet-address">
                            {walletState.publicKey.slice(0, 6)}...{walletState.publicKey.slice(-4)}
                        </div>
                        <div className="wallet-network">{walletState.network}</div>
                    </div>
                </div>
                <button 
                    onClick={handleDisconnect}
                    className="disconnect-button"
                    title="Disconnect wallet"
                >
                    🔌
                </button>
            </div>
        );
    }

    // Render connection button
    return (
        <div className="simple-wallet-disconnected">
            <button
                onClick={handleConnect}
                disabled={walletState.isConnecting}
                className={`connect-button ${!walletState.isInstalled ? 'install-mode' : ''}`}
            >
                {walletState.isConnecting ? '🔄 Connecting...' : '🚀 Connect Wallet'}
            </button>

            {walletState.error && (
                <div className="error-message">
                    ❌ {walletState.error}
                </div>
            )}



            <div className="status-indicator">
                <div className={`status-dot ${walletState.isInstalled ? 'installed' : 'not-installed'}`}></div>
                <span className="status-text">
                    {walletState.isInstalled ? 'Wallet detected' : 'Wallet not found'}
                </span>
            </div>
        </div>
    );
};

export default SimpleWalletConnect;