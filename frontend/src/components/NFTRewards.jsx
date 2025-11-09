import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NFTRewards.css';

const NFTRewards = ({ userStats, completedContests }) => {
    const [selectedNFT, setSelectedNFT] = useState(null);

    // Sample NFT rewards
    const nftRewards = [
        {
            id: 1,
            name: 'Fitness Champion',
            description: 'Completed 30-Day Fitness Challenge',
            image: '🏆',
            rarity: 'Legendary',
            earnedDate: '2024-10-15',
            contestId: 1,
            attributes: {
                'Challenge Type': '30-Day Challenge',
                'Distance Covered': '150 km',
                'Days Completed': '30/30',
                'Rank': '#156'
            },
            tokenId: 'FC001',
            blockchain: 'Ethereum',
            value: '0.05 ETH'
        },
        {
            id: 2,
            name: 'Sprint Master',
            description: 'Completed Young Athletes Sprint Challenge',
            image: '🥇',
            rarity: 'Epic',
            earnedDate: '2024-10-01',
            contestId: 3,
            attributes: {
                'Challenge Type': 'Sprint Challenge',
                'Distance Covered': '210 km',
                'Days Completed': '21/21',
                'Rank': '#89'
            },
            tokenId: 'SM002',
            blockchain: 'Ethereum',
            value: '0.08 ETH'
        }
    ];

    // Upcoming rewards based on current contests
    const upcomingRewards = [
        {
            id: 3,
            name: 'Wellness Warrior',
            description: 'Complete Senior Wellness Journey',
            image: '⚔️',
            rarity: 'Rare',
            daysLeft: 8,
            progress: 53,
            contestId: 2
        },
        {
            id: 4,
            name: 'Prime Athlete',
            description: 'Complete Prime Fitness Challenge',
            image: '💪',
            rarity: 'Epic',
            daysLeft: 12,
            progress: 48,
            contestId: 4
        }
    ];

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'Legendary': return '#D4AF37';
            case 'Epic': return '#8B5CF6';
            case 'Rare': return '#3B82F6';
            case 'Common': return '#10B981';
            default: return '#6B7280';
        }
    };

    const handleNFTClick = (nft) => {
        setSelectedNFT(nft);
    };

    const handleCloseModal = () => {
        setSelectedNFT(null);
    };

    return (
        <div className="nft-rewards">
            <div className="rewards-header">
                <h3>Your NFT Collection</h3>
                <div className="collection-stats">
                    <span className="stat">
                        <strong>{nftRewards.length}</strong> NFTs Owned
                    </span>
                    <span className="stat">
                        <strong>{userStats.tokensEarned}</strong> FIT Tokens
                    </span>
                    <span className="stat">
                        <strong>~0.13 ETH</strong> Total Value
                    </span>
                </div>
            </div>

            {/* Earned NFTs */}
            <div className="nft-section">
                <h4>Earned NFTs ({nftRewards.length})</h4>
                <div className="nft-grid">
                    {nftRewards.map(nft => (
                        <motion.div
                            key={nft.id}
                            className="nft-card earned"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleNFTClick(nft)}
                        >
                            <div className="nft-image">
                                <span className="nft-emoji">{nft.image}</span>
                                <div className="rarity-badge" style={{ backgroundColor: getRarityColor(nft.rarity) }}>
                                    {nft.rarity}
                                </div>
                            </div>
                            <div className="nft-info">
                                <h5>{nft.name}</h5>
                                <p>{nft.description}</p>
                                <div className="nft-meta">
                                    <span className="token-id">#{nft.tokenId}</span>
                                    <span className="earned-date">{new Date(nft.earnedDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Upcoming Rewards */}
            <div className="nft-section">
                <h4>Upcoming Rewards ({upcomingRewards.length})</h4>
                <div className="nft-grid">
                    {upcomingRewards.map(nft => (
                        <motion.div
                            key={nft.id}
                            className="nft-card upcoming"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="nft-image">
                                <span className="nft-emoji locked">{nft.image}</span>
                                <div className="rarity-badge" style={{ backgroundColor: getRarityColor(nft.rarity) }}>
                                    {nft.rarity}
                                </div>
                                <div className="progress-overlay">
                                    <div className="progress-circle">
                                        <span>{nft.progress}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="nft-info">
                                <h5>{nft.name}</h5>
                                <p>{nft.description}</p>
                                <div className="nft-meta">
                                    <span className="days-left">{nft.daysLeft} days left</span>
                                    <span className="progress-text">{nft.progress}% complete</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Token Balance */}
            <div className="token-section">
                <div className="token-card">
                    <div className="token-icon">🪙</div>
                    <div className="token-info">
                        <h4>FIT Token Balance</h4>
                        <div className="token-balance">{userStats.tokensEarned} FIT</div>
                        <p>Earn tokens by completing challenges and maintaining streaks</p>
                    </div>
                    <button className="token-action">
                        Trade Tokens
                    </button>
                </div>
            </div>

            {/* NFT Detail Modal */}
            <AnimatePresence>
                {selectedNFT && (
                    <motion.div
                        className="nft-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            className="nft-modal"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="close-modal" onClick={handleCloseModal}>×</button>

                            <div className="modal-content">
                                <div className="modal-image">
                                    <span className="modal-emoji">{selectedNFT.image}</span>
                                    <div className="modal-rarity" style={{ backgroundColor: getRarityColor(selectedNFT.rarity) }}>
                                        {selectedNFT.rarity}
                                    </div>
                                </div>

                                <div className="modal-details">
                                    <h3>{selectedNFT.name}</h3>
                                    <p className="modal-description">{selectedNFT.description}</p>

                                    <div className="modal-attributes">
                                        <h4>Attributes</h4>
                                        {Object.entries(selectedNFT.attributes).map(([key, value]) => (
                                            <div key={key} className="attribute-row">
                                                <span className="attribute-key">{key}:</span>
                                                <span className="attribute-value">{value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="modal-blockchain">
                                        <div className="blockchain-info">
                                            <span className="blockchain-label">Blockchain:</span>
                                            <span className="blockchain-value">{selectedNFT.blockchain}</span>
                                        </div>
                                        <div className="blockchain-info">
                                            <span className="blockchain-label">Token ID:</span>
                                            <span className="blockchain-value">#{selectedNFT.tokenId}</span>
                                        </div>
                                        <div className="blockchain-info">
                                            <span className="blockchain-label">Estimated Value:</span>
                                            <span className="blockchain-value">{selectedNFT.value}</span>
                                        </div>
                                    </div>

                                    <div className="modal-actions">
                                        <button className="view-blockchain">View on Etherscan</button>
                                        <button className="share-nft">Share Achievement</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NFTRewards;