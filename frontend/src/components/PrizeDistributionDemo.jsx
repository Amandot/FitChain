import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { distributeContestPrizes, formatXLMAmount } from '../utils/stellarPayments';
import { useWallet } from '../App';

const PrizeDistributionDemo = () => {
    const [isDistributing, setIsDistributing] = useState(false);
    const [results, setResults] = useState([]);
    const walletContext = useWallet();

    const mumbaiMarathonWinners = [
        {
            name: "Sahil Kumar",
            wallet: "GC2UMV5DNIKT7Y7SHXXEUM745WVZEQGZUGETGLLKMK64WIPHXB3TYKLL",
            amount: 300,
            rank: 1,
            distance: 21.5,
            location: "Mumbai, Maharashtra"
        },
        {
            name: "Priya Sharma", 
            wallet: "GAXJWF7QZPX4VQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZX",
            amount: 150,
            rank: 2,
            distance: 21.2,
            location: "Mumbai, Maharashtra"
        },
        {
            name: "Arjun Patel",
            wallet: "GBXJWF7QZPX4VQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZX",
            amount: 50,
            rank: 3,
            distance: 21.0,
            location: "Navi Mumbai, Maharashtra"
        }
    ];

    const handleDistributePrizes = async () => {
        if (!walletContext.isConnected) {
            alert('Please connect your Stellar wallet first!');
            return;
        }

        setIsDistributing(true);
        setResults([]);

        try {
            const distributionResults = await distributeContestPrizes(
                walletContext.walletAddress,
                mumbaiMarathonWinners,
                "1" // Mumbai Marathon Contest ID
            );

            setResults(distributionResults);
            
            const successCount = distributionResults.filter(r => r.success).length;
            alert(`Prize distribution complete! ${successCount}/${distributionResults.length} payments successful.`);

        } catch (error) {
            console.error('Distribution error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsDistributing(false);
        }
    };

    return (
        <div className="prize-distribution-demo">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="demo-container"
            >
                <div className="demo-header">
                    <h2>🏆 Mumbai Marathon Prize Distribution</h2>
                    <p>Distribute XLM prizes to contest winners on Stellar network</p>
                </div>

                <div className="contest-info">
                    <div className="info-card">
                        <h3>Contest Details</h3>
                        <div className="contest-stats">
                            <div className="stat">
                                <span className="label">Contest:</span>
                                <span className="value">Mumbai Marathon Challenge</span>
                            </div>
                            <div className="stat">
                                <span className="label">Total Prize Pool:</span>
                                <span className="value">500 XLM</span>
                            </div>
                            <div className="stat">
                                <span className="label">Winners:</span>
                                <span className="value">3 participants</span>
                            </div>
                            <div className="stat">
                                <span className="label">Status:</span>
                                <span className="value completed">✅ Completed</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="winners-list">
                    <h3>🏅 Prize Recipients</h3>
                    <div className="winners-grid">
                        {mumbaiMarathonWinners.map((winner, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`winner-card rank-${winner.rank}`}
                            >
                                <div className="winner-header">
                                    <span className="rank-badge">
                                        {winner.rank === 1 ? '🥇' : winner.rank === 2 ? '🥈' : '🥉'}
                                        Rank #{winner.rank}
                                    </span>
                                    <span className="prize-amount">{winner.amount} XLM</span>
                                </div>
                                
                                <div className="winner-info">
                                    <h4>{winner.name}</h4>
                                    <p className="distance">Distance: {winner.distance} km</p>
                                    <p className="location">📍 {winner.location}</p>
                                    <p className="wallet">
                                        Wallet: {winner.wallet.slice(0, 8)}...{winner.wallet.slice(-8)}
                                    </p>
                                </div>

                                {results.length > 0 && (
                                    <div className="payment-status">
                                        {(() => {
                                            const result = results.find(r => r.wallet === winner.wallet);
                                            if (result) {
                                                return result.success ? (
                                                    <div className="success-status">
                                                        <span className="status-icon">✅</span>
                                                        <span>Payment Sent!</span>
                                                        <small>TX: {result.transactionHash?.slice(0, 8)}...</small>
                                                    </div>
                                                ) : (
                                                    <div className="error-status">
                                                        <span className="status-icon">❌</span>
                                                        <span>Failed</span>
                                                        <small>{result.error}</small>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="distribution-controls">
                    {walletContext.isConnected ? (
                        <div className="connected-controls">
                            <div className="wallet-info">
                                <span className="wallet-label">Connected Wallet:</span>
                                <span className="wallet-address">
                                    {walletContext.formatAddress(walletContext.walletAddress)}
                                </span>
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleDistributePrizes}
                                disabled={isDistributing}
                                className="distribute-btn"
                            >
                                {isDistributing ? (
                                    <>
                                        <span className="loading-spinner">⏳</span>
                                        Distributing Prizes...
                                    </>
                                ) : (
                                    <>
                                        💸 Distribute Prizes
                                    </>
                                )}
                            </motion.button>
                        </div>
                    ) : (
                        <div className="connect-prompt">
                            <p>Connect your Stellar wallet to distribute prizes</p>
                            <button className="connect-wallet-btn">
                                🚀 Connect Wallet
                            </button>
                        </div>
                    )}
                </div>

                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="results-summary"
                    >
                        <h3>📊 Distribution Results</h3>
                        <div className="summary-stats">
                            <div className="summary-stat success">
                                <span className="stat-number">
                                    {results.filter(r => r.success).length}
                                </span>
                                <span className="stat-label">Successful</span>
                            </div>
                            <div className="summary-stat failed">
                                <span className="stat-number">
                                    {results.filter(r => !r.success).length}
                                </span>
                                <span className="stat-label">Failed</span>
                            </div>
                            <div className="summary-stat total">
                                <span className="stat-number">
                                    {results.reduce((sum, r) => sum + (r.success ? r.amount : 0), 0)} XLM
                                </span>
                                <span className="stat-label">Total Distributed</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            <style jsx>{`
                .prize-distribution-demo {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    color: white;
                }

                .demo-container {
                    background: rgba(0, 0, 0, 0.8);
                    border-radius: 20px;
                    padding: 30px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .demo-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .demo-header h2 {
                    color: #FFD700;
                    margin: 0 0 10px 0;
                }

                .contest-info {
                    margin-bottom: 30px;
                }

                .info-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .contest-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }

                .stat {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .stat .label {
                    color: #888;
                }

                .stat .value {
                    color: #fff;
                    font-weight: 600;
                }

                .stat .value.completed {
                    color: #22C55E;
                }

                .winners-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-top: 15px;
                }

                .winner-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                }

                .winner-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .winner-card.rank-1 {
                    border-color: #FFD700;
                    background: rgba(255, 215, 0, 0.1);
                }

                .winner-card.rank-2 {
                    border-color: #C0C0C0;
                    background: rgba(192, 192, 192, 0.1);
                }

                .winner-card.rank-3 {
                    border-color: #CD7F32;
                    background: rgba(205, 127, 50, 0.1);
                }

                .winner-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .rank-badge {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 5px 10px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                }

                .prize-amount {
                    color: #FFD700;
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .winner-info h4 {
                    margin: 0 0 10px 0;
                    color: #fff;
                }

                .winner-info p {
                    margin: 5px 0;
                    color: #ccc;
                    font-size: 0.9rem;
                }

                .wallet {
                    font-family: monospace;
                    font-size: 0.8rem !important;
                    color: #888 !important;
                }

                .distribution-controls {
                    margin: 30px 0;
                    text-align: center;
                }

                .connected-controls {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }

                .wallet-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #888;
                }

                .wallet-address {
                    color: #FFD700;
                    font-family: monospace;
                }

                .distribute-btn {
                    background: linear-gradient(135deg, #FFD700, #FFA500);
                    color: #000;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .distribute-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .loading-spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .payment-status {
                    margin-top: 15px;
                    padding: 10px;
                    border-radius: 8px;
                    text-align: center;
                }

                .success-status {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22C55E;
                }

                .error-status {
                    background: rgba(239, 68, 68, 0.2);
                    color: #EF4444;
                }

                .results-summary {
                    margin-top: 30px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 20px;
                }

                .summary-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-top: 15px;
                }

                .summary-stat {
                    text-align: center;
                    padding: 15px;
                    border-radius: 10px;
                }

                .summary-stat.success {
                    background: rgba(34, 197, 94, 0.2);
                }

                .summary-stat.failed {
                    background: rgba(239, 68, 68, 0.2);
                }

                .summary-stat.total {
                    background: rgba(59, 130, 246, 0.2);
                }

                .stat-number {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 5px;
                }

                .stat-label {
                    color: #888;
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
};

export default PrizeDistributionDemo;