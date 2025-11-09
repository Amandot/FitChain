import React, { useState, useEffect } from 'react';
import { distributeContestPrizes, formatXLMAmount, CONTEST_PRIZES } from '../utils/stellarPayments';
import { useWallet } from '../App';
import './ContestLeaderboard.css';

const ContestLeaderboard = () => {
    const [contests, setContests] = useState([]);
    const [selectedContest, setSelectedContest] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [distributingPrizes, setDistributingPrizes] = useState(false);
    const [prizeResults, setPrizeResults] = useState([]);
    
    const walletContext = useWallet();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            setLoading(true);
            
            // Mock contests data with completed Mumbai Marathon
            const mockContests = [
                {
                    id: 1,
                    title: "Mumbai Marathon Challenge",
                    status: "completed",
                    participant_count: 156,
                    prize_pool: "500",
                    target_distance: "21",
                    age_category: "18-35",
                    description: "Complete 21km marathon challenge in Mumbai area",
                    completed_date: "2024-10-20"
                },
                {
                    id: 2,
                    title: "30-Day Fitness Challenge",
                    status: "active",
                    participant_count: 1247,
                    prize_pool: "100",
                    target_distance: "150",
                    age_category: "18-30"
                },
                {
                    id: 3,
                    title: "Senior Wellness Journey",
                    status: "active",
                    participant_count: 432,
                    prize_pool: "75",
                    target_distance: "30",
                    age_category: "50+"
                }
            ];

            setContests(mockContests);
            
            // Auto-select the completed Mumbai Marathon
            const completedContest = mockContests.find(c => c.status === 'completed');
            if (completedContest) {
                setSelectedContest(completedContest);
                fetchContestLeaderboard(completedContest.id);
            }
        } catch (err) {
            setError('Connection error loading contests.');
        } finally {
            setLoading(false);
        }
    };

    const fetchContestLeaderboard = async (contestId) => {
        try {
            setLoading(true);
            
            // Mock leaderboard data for Mumbai Marathon Challenge
            if (contestId === 1) {
                const mockLeaderboard = [
                    {
                        rank_position: 1,
                        username: "Sahil Kumar",
                        user_wallet: "GC2UMV5DNIKT7Y7SHXXEUM745WVZEQGZUGETGLLKMK64WIPHXB3TYKLL",
                        current_distance: 21.5,
                        completed: true,
                        prize_received: true,
                        prize_amount: 300,
                        location: "Mumbai, Maharashtra"
                    },
                    {
                        rank_position: 2,
                        username: "Priya Sharma",
                        user_wallet: "GAXJWF7QZPX4VQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZX",
                        current_distance: 21.2,
                        completed: true,
                        prize_received: true,
                        prize_amount: 150,
                        location: "Mumbai, Maharashtra"
                    },
                    {
                        rank_position: 3,
                        username: "Arjun Patel",
                        user_wallet: "GBXJWF7QZPX4VQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZX",
                        current_distance: 21.0,
                        completed: true,
                        prize_received: true,
                        prize_amount: 50,
                        location: "Navi Mumbai, Maharashtra"
                    },
                    {
                        rank_position: 4,
                        username: "Neha Singh",
                        user_wallet: "GCXJWF7QZPX4VQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZX",
                        current_distance: 20.8,
                        completed: true,
                        prize_received: false,
                        prize_amount: 25,
                        location: "Thane, Maharashtra"
                    },
                    {
                        rank_position: 5,
                        username: "Rohit Mehta",
                        user_wallet: "GDXJWF7QZPX4VQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZX",
                        current_distance: 20.5,
                        completed: true,
                        prize_received: false,
                        prize_amount: 15,
                        location: "Pune, Maharashtra"
                    },
                    {
                        rank_position: 6,
                        username: "Kavya Reddy",
                        user_wallet: "GEXJWF7QZPX4VQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZXZQZX",
                        current_distance: 20.2,
                        completed: true,
                        prize_received: false,
                        prize_amount: 10,
                        location: "Mumbai, Maharashtra"
                    }
                ];
                setLeaderboard(mockLeaderboard);
            } else {
                setLeaderboard([]);
            }
        } catch (err) {
            setError('Failed to fetch leaderboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleContestSelect = (contest) => {
        setSelectedContest(contest);
        fetchContestLeaderboard(contest.id);
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return '👑'; // Crown for 1st place
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    const getRankClass = (rank) => {
        switch (rank) {
            case 1: return 'rank-first';
            case 2: return 'rank-second';
            case 3: return 'rank-third';
            default: return 'rank-other';
        }
    };

    const formatWalletAddress = (address) => {
        if (!address) return 'N/A';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getContestStatusBadge = (status) => {
        const statusConfig = {
            completed: { icon: '✅', class: 'status-completed', text: 'Completed' },
            active: { icon: '🔥', class: 'status-active', text: 'Active' },
            upcoming: { icon: '⏳', class: 'status-upcoming', text: 'Upcoming' }
        };

        const config = statusConfig[status] || { icon: '❓', class: 'status-unknown', text: status };

        return (
            <span className={`status-badge ${config.class}`}>
                {config.icon} {config.text}
            </span>
        );
    };

    const handleDistributePrizes = async () => {
        if (!walletContext.isConnected) {
            alert('Please connect your Stellar wallet first to distribute prizes.');
            return;
        }

        if (!selectedContest || selectedContest.status !== 'completed') {
            alert('Can only distribute prizes for completed contests.');
            return;
        }

        const unpaidWinners = leaderboard.filter(p => !p.prize_received && p.rank_position <= 3);
        
        if (unpaidWinners.length === 0) {
            alert('All prizes have already been distributed for this contest.');
            return;
        }

        const confirmDistribution = confirm(
            `Distribute prizes to ${unpaidWinners.length} winners?\n\n` +
            unpaidWinners.map(w => `${w.username} (Rank ${w.rank_position}): ${w.prize_amount} XLM`).join('\n')
        );

        if (!confirmDistribution) return;

        setDistributingPrizes(true);
        setPrizeResults([]);

        try {
            const winners = unpaidWinners.map(participant => ({
                name: participant.username,
                wallet: participant.user_wallet,
                amount: participant.prize_amount,
                rank: participant.rank_position
            }));

            const results = await distributeContestPrizes(
                walletContext.walletAddress,
                winners,
                selectedContest.id
            );

            setPrizeResults(results);

            // Update leaderboard to mark prizes as received for successful transactions
            const updatedLeaderboard = leaderboard.map(participant => {
                const result = results.find(r => r.wallet === participant.user_wallet);
                if (result && result.success) {
                    return { ...participant, prize_received: true };
                }
                return participant;
            });

            setLeaderboard(updatedLeaderboard);

            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;

            alert(
                `Prize Distribution Complete!\n\n` +
                `✅ Successful: ${successCount}\n` +
                `❌ Failed: ${failCount}\n\n` +
                `Check the transaction details below.`
            );

        } catch (error) {
            console.error('Prize distribution error:', error);
            alert(`Error distributing prizes: ${error.message}`);
        } finally {
            setDistributingPrizes(false);
        }
    };

    if (loading && !selectedContest) {
        return (
            <div className="contest-leaderboard-container">
                <div className="loading-state">
                    <div className="loading-spinner">⏳</div>
                    <p>Loading contests...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="contest-leaderboard-container">
                <div className="error-state">
                    <div className="error-icon">❌</div>
                    <h3>Connection Error</h3>
                    <p>{error}</p>
                    <button onClick={fetchContests} className="retry-button">
                        🔄 Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="contest-leaderboard-container">
            <div className="contest-leaderboard-header">
                <h2>🏆 Contest Leaderboards</h2>
                <p>View winners and rankings for each contest event</p>
            </div>

            <div className="contest-selector">
                <h3>📋 Select Contest Event</h3>
                <div className="contest-grid">
                    {contests.map((contest) => (
                        <div
                            key={contest.id}
                            className={`contest-card ${selectedContest?.id === contest.id ? 'selected' : ''}`}
                            onClick={() => handleContestSelect(contest)}
                        >
                            <div className="contest-card-header">
                                <h4>{contest.title}</h4>
                                {getContestStatusBadge(contest.status)}
                            </div>

                            <div className="contest-card-info">
                                <div className="contest-stat">
                                    <span className="stat-label">Participants</span>
                                    <span className="stat-value">{contest.participant_count || 0}</span>
                                </div>
                                <div className="contest-stat">
                                    <span className="stat-label">Prize Pool</span>
                                    <span className="stat-value">{contest.prize_pool} XLM</span>
                                </div>
                                <div className="contest-stat">
                                    <span className="stat-label">Target</span>
                                    <span className="stat-value">{contest.target_distance} km</span>
                                </div>
                            </div>

                            <div className="contest-card-footer">
                                <span className="contest-id">Contest ID: #{contest.id}</span>
                                <span className="contest-age">{contest.age_category}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedContest && (
                <div className="leaderboard-section">
                    <div className="leaderboard-header">
                        <div className="selected-contest-info">
                            <h3>🏁 {selectedContest.title} - Leaderboard</h3>
                            <div className="contest-details">
                                <span className="contest-id-badge">
                                    🆔 Contest ID: #{selectedContest.id}
                                </span>
                                {getContestStatusBadge(selectedContest.status)}
                                <span className="age-category-badge">
                                    👥 {selectedContest.age_category}
                                </span>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner">⏳</div>
                            <p>Loading leaderboard...</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="no-data-state">
                            <div className="no-data-icon">📊</div>
                            <h4>No Results Yet</h4>
                            <p>This contest doesn't have any results to display.</p>
                        </div>
                    ) : (
                        <div className="leaderboard-table">
                            <div className="table-header">
                                <div className="rank-col">Rank</div>
                                <div className="user-col">Participant</div>
                                <div className="distance-col">Distance</div>
                                <div className="id-col">User ID</div>
                                <div className="status-col">Status</div>
                            </div>

                            <div className="table-body">
                                {leaderboard.map((participant, index) => (
                                    <div
                                        key={participant.user_wallet}
                                        className={`table-row ${getRankClass(participant.rank_position)}`}
                                    >
                                        <div className="rank-col">
                                            <div className={`rank-badge ${getRankClass(participant.rank_position)}`}>
                                                <span className="rank-icon">
                                                    {getRankIcon(participant.rank_position)}
                                                </span>
                                                <span className="rank-number">
                                                    {participant.rank_position === 1 ? 'WINNER' : `#${participant.rank_position}`}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="user-col">
                                            <div className="user-info">
                                                <div className="username">
                                                    {participant.username || 'Anonymous'}
                                                    {participant.rank_position === 1 && (
                                                        <span className="winner-badge">🏆 CHAMPION</span>
                                                    )}
                                                </div>
                                                <div className="wallet-address">
                                                    {formatWalletAddress(participant.user_wallet)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="distance-col">
                                            <div className="distance-info">
                                                <span className="distance-value">
                                                    {participant.current_distance?.toFixed(1) || '0.0'} km
                                                </span>
                                                {participant.rank_position === 1 && (
                                                    <span className="winning-distance">🎯 WINNING DISTANCE</span>
                                                )}
                                                {participant.prize_amount && (
                                                    <div className="prize-info">
                                                        <span className="prize-amount">💰 {participant.prize_amount} XLM</span>
                                                        <span className={`prize-status ${participant.prize_received ? 'received' : 'pending'}`}>
                                                            {participant.prize_received ? '✅ Received' : '⏳ Pending'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="id-col">
                                            <div className="user-id-badge">
                                                <span className="id-label">ID:</span>
                                                <span className="id-value">
                                                    {participant.user_wallet.slice(-6).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="status-col">
                                            <span className={`completion-badge ${participant.completed ? 'completed' : 'incomplete'}`}>
                                                {participant.completed ? '✅ Completed' : '⏳ In Progress'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedContest && leaderboard.length > 0 && (
                        <div className="contest-summary">
                            <div className="summary-card">
                                <h4>🏆 Contest Summary</h4>
                                <div className="summary-stats">
                                    <div className="summary-stat">
                                        <span className="stat-icon">👑</span>
                                        <div className="stat-info">
                                            <span className="stat-label">Champion</span>
                                            <span className="stat-value">
                                                {leaderboard[0]?.username || 'TBD'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="summary-stat">
                                        <span className="stat-icon">🎯</span>
                                        <div className="stat-info">
                                            <span className="stat-label">Winning Distance</span>
                                            <span className="stat-value">
                                                {leaderboard[0]?.current_distance?.toFixed(1) || '0.0'} km
                                            </span>
                                        </div>
                                    </div>
                                    <div className="summary-stat">
                                        <span className="stat-icon">💰</span>
                                        <div className="stat-info">
                                            <span className="stat-label">Prize Pool</span>
                                            <span className="stat-value">
                                                {selectedContest.prize_pool} XLM
                                            </span>
                                        </div>
                                    </div>
                                    <div className="summary-stat">
                                        <span className="stat-icon">🆔</span>
                                        <div className="stat-info">
                                            <span className="stat-label">Contest ID</span>
                                            <span className="stat-value">
                                                #{selectedContest.id}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Prize Distribution Section */}
                                {selectedContest.status === 'completed' && walletContext.isConnected && (
                                    <div className="prize-distribution-section">
                                        <h5>💰 Prize Distribution</h5>
                                        <div className="prize-actions">
                                            <button
                                                onClick={handleDistributePrizes}
                                                disabled={distributingPrizes}
                                                className="distribute-prizes-btn"
                                            >
                                                {distributingPrizes ? '🔄 Distributing...' : '💸 Distribute Prizes'}
                                            </button>
                                            <div className="prize-info-text">
                                                <span>Connected: {walletContext.formatAddress(walletContext.walletAddress)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Prize Distribution Results */}
                    {prizeResults.length > 0 && (
                        <div className="prize-results-section">
                            <div className="results-card">
                                <h4>💸 Prize Distribution Results</h4>
                                <div className="results-list">
                                    {prizeResults.map((result, index) => (
                                        <div key={index} className={`result-item ${result.success ? 'success' : 'failed'}`}>
                                            <div className="result-info">
                                                <span className="result-icon">
                                                    {result.success ? '✅' : '❌'}
                                                </span>
                                                <div className="result-details">
                                                    <span className="winner-name">{result.winner}</span>
                                                    <span className="result-amount">{result.amount} XLM</span>
                                                    <span className="result-rank">Rank #{result.rank}</span>
                                                </div>
                                            </div>
                                            <div className="result-status">
                                                {result.success ? (
                                                    <div className="success-details">
                                                        <span className="tx-hash">
                                                            TX: {result.transactionHash?.slice(0, 8)}...
                                                        </span>
                                                        <a 
                                                            href={`https://stellar.expert/explorer/testnet/tx/${result.transactionHash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="view-tx-btn"
                                                        >
                                                            🔍 View
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="error-message">{result.error}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContestLeaderboard;