import { useState, useEffect } from 'react';
import './BlockchainStatus.css';

const BlockchainStatus = ({ provider, networkInfo, walletAddress }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [status, setStatus] = useState({
        infura: 'checking',
        metamask: 'checking',
        contract: 'checking'
    });

    useEffect(() => {
        checkStatus();
    }, [provider, networkInfo, walletAddress]);

    const checkStatus = () => {
        // Check Infura connection
        const infuraKey = import.meta.env.VITE_PUBLIC_INFURA_API_KEY;
        const contractAddress = import.meta.env.VITE_PUBLIC_CONTRACT_ADDRESS;

        setStatus({
            infura: infuraKey ? (provider ? 'connected' : 'error') : 'missing',
            metamask: walletAddress ? 'connected' : 'disconnected',
            contract: contractAddress && contractAddress !== '0x...Your...Deployed...Address...' ? 'configured' : 'missing'
        });
    };

    const getStatusIcon = (statusType) => {
        switch (statusType) {
            case 'connected':
            case 'configured':
                return '✅';
            case 'disconnected':
                return '⚪';
            case 'missing':
            case 'error':
                return '❌';
            default:
                return '🔄';
        }
    };

    const getStatusText = (statusType) => {
        switch (statusType) {
            case 'connected': return 'Connected';
            case 'configured': return 'Configured';
            case 'disconnected': return 'Disconnected';
            case 'missing': return 'Missing';
            case 'error': return 'Error';
            default: return 'Checking...';
        }
    };

    if (!isVisible) {
        return (
            <button
                className="blockchain-status-toggle"
                onClick={() => setIsVisible(true)}
                title="Show Blockchain Status"
            >
                🔗
            </button>
        );
    }

    return (
        <div className="blockchain-status-panel">
            <div className="status-header">
                <h4>🔗 Blockchain Status</h4>
                <button
                    className="close-button"
                    onClick={() => setIsVisible(false)}
                >
                    ✕
                </button>
            </div>

            <div className="status-items">
                <div className="status-item">
                    <span className="status-icon">{getStatusIcon(status.infura)}</span>
                    <span className="status-label">Infura RPC</span>
                    <span className="status-value">{getStatusText(status.infura)}</span>
                </div>

                <div className="status-item">
                    <span className="status-icon">{getStatusIcon(status.metamask)}</span>
                    <span className="status-label">MetaMask</span>
                    <span className="status-value">{getStatusText(status.metamask)}</span>
                </div>

                <div className="status-item">
                    <span className="status-icon">{getStatusIcon(status.contract)}</span>
                    <span className="status-label">Contract</span>
                    <span className="status-value">{getStatusText(status.contract)}</span>
                </div>
            </div>

            {networkInfo && (
                <div className="network-info">
                    <div className="info-item">
                        <span className="info-label">Network:</span>
                        <span className="info-value">{networkInfo.name}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Chain ID:</span>
                        <span className="info-value">{networkInfo.chainId}</span>
                    </div>
                </div>
            )}

            <div className="debug-actions">
                <button
                    className="debug-button"
                    onClick={() => window.runBlockchainTests?.()}
                >
                    🔧 Run Tests
                </button>
            </div>
        </div>
    );
};

export default BlockchainStatus;