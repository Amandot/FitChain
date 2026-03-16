import React, { useState, useEffect } from 'react';
import { connectWallet, isWalletInstalled } from '../utils/stellarWallet';
import './StellarWalletConnect.css';

const StellarWalletConnect = ({ onWalletConnect, onWalletDisconnect }) => {
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [message, setMessage] = useState('');

    const [freighterAvailable, setFreighterAvailable] = useState(false);

    // Check for Freighter and existing connection
    useEffect(() => {
        const initWallet = async () => {
            await checkFreighterAvailability();
            await checkConnection();
        };
        
        initWallet();
        
        // Check every 2 seconds for Freighter availability and connection
        const interval = setInterval(async () => {
            await checkFreighterAvailability();
            if (freighterAvailable && !walletAddress) {
                await checkConnection();
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [freighterAvailable, walletAddress]);



    const checkFreighterAvailability = async () => {
        const available = await isWalletInstalled();
        setFreighterAvailable(available);
        
        if (available) {
            if (!walletAddress) {
                setMessage('');
            }
        } else {
            if (!walletAddress) {
                setMessage('');
            }
        }
        
        return available;
    };

    const checkConnection = async () => {
        if (!freighterAvailable) {
            return;
        }

        try {
            const isAllowed = await window.freighter.isAllowed();

            if (isAllowed) {
                const publicKey = await window.freighter.getPublicKey();
                
                if (publicKey) {
                    setWalletAddress(publicKey);
                    setMessage(`✅ Connected: ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`);
                    
                    if (onWalletConnect) {
                        onWalletConnect({ 
                            publicKey, 
                            walletType: 'freighter', 
                            isConnected: true,
                            timestamp: Date.now()
                        });
                    }
                } else {
                    setMessage('⚠️ No account found in Freighter');
                }
            } else {
                setMessage('🔐 Click to connect wallet');
            }
        } catch (error) {
            console.log('Connection check failed:', error);
            setMessage('');
        }
    };

    const handleConnect = async () => {
        if (!freighterAvailable) {
            // Wallet not available
            const installNow = confirm(
                'A Stellar wallet extension is required to connect.\n\n' +
                'Click OK to install Freighter wallet from Chrome Web Store.'
            );
            
            if (installNow) {
                window.open('https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk', '_blank');
                setMessage('🔗 Opening wallet installation page...');
            }
            return;
        }

        setIsConnecting(true);
        setMessage('🔄 Connecting to wallet...');

        try {
            // Use the new connectWallet function
            const publicKey = await connectWallet();

            if (!publicKey) {
                throw new Error('Connection was rejected or no account found');
            }

            // Success!
            setWalletAddress(publicKey);
            setMessage(`✅ Connected: ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`);
            
            // Call the callback
            if (onWalletConnect) {
                onWalletConnect({
                    publicKey,
                    walletType: 'freighter',
                    isConnected: true,
                    timestamp: Date.now()
                });
            }

        } catch (error) {
            console.error('Wallet connection error:', error);
            
            // User-friendly error messages
            if (error.message && error.message.includes('User declined') || error.message.includes('rejected')) {
                setMessage('❌ Connection cancelled by user');
            } else if (error.message && error.message.includes('No account')) {
                setMessage('❌ No account found - Please create an account in your wallet');
            } else {
                setMessage(`❌ Connection failed: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = () => {
        setWalletAddress('');
        setMessage('🔌 Disconnected');
        
        if (onWalletDisconnect) {
            onWalletDisconnect();
        }
    };

    return (
        <div className="stellar-wallet-simple">
            {walletAddress ? (
                // Connected State
                <div className="wallet-connected-simple">
                    <div className="wallet-info-simple">
                        <span className="wallet-icon">🚀</span>
                        <div className="wallet-text">
                            <div className="wallet-label">Stellar Wallet</div>
                            <div className="wallet-address">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
                        </div>
                    </div>
                    <button 
                        onClick={handleDisconnect} 
                        className="disconnect-btn-simple"
                        title="Disconnect wallet"
                    >
                        🔌
                    </button>
                </div>
            ) : (
                // Not Connected State
                <div className="wallet-disconnected-simple">
                    <button 
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className={`connect-btn-simple ${!freighterAvailable ? 'install-mode' : ''}`}
                        title={!freighterAvailable ? 'Connect with Stellar wallet' : 'Connect to your wallet'}
                    >
                        {isConnecting ? '🔄 Connecting...' : '🚀 Connect Wallet'}
                    </button>
                    

                </div>
            )}

            {message && message.trim() !== '' && (
                <div className={`message-simple ${
                    message.includes('✅') ? 'success' : 
                    message.includes('❌') ? 'error' : 
                    message.includes('⚠️') ? 'warning' : 
                    'info'
                }`}>
                    {message}
                </div>
            )}


        </div>
    );
};

export default StellarWalletConnect;
