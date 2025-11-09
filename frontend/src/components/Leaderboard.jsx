import React, { useState, useEffect } from 'react';
import './Leaderboard.css';

const Leaderboard = () => {
    const [activeTab, setActiveTab] = useState('global');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [contestData, setContestData] = useState([]);
    const [paymentData, setPaymentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgeCategory, setSelectedAgeCategory] = useState('all');
    const [selectedContest, setSelectedContest] = useState('');

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

    const ageCategories = ['all', '18-25', '26-35', '36-45', '46-55', '55+'];

    useEffect(() => {
        fetchData();
    }, [activeTab, selectedAgeCategory, selectedContest]);

    const fetchData = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'global':
                    await fetchGlobalLeaderboard();
                    break;
                case 'contests':
                    await fetchContestData();
                    break;
                case 'payments':
                    await fetchPaymentData();
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGlobalLeaderboard = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedAgeCategory !== 'all') {
                params.append('age_category', selectedAgeCategory);
            }
            params.append('limit', '50');

            const response = await fetch(`${API_BASE_URL}/leaderboard/global?${params}`);
            const data = await response.json();

            if (data.success) {
                setLeaderboardData(data.data);
            }
        } catch (error) {
            console.error('Error fetching global leaderboard:', error);
        }
    };

    const fetchContestData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/contests/status/completed?limit=20`);
            const data = await response.json();

            if (data.success) {
                setContestData(data.data);
            }
        } catch (error) {
            console.error('Error fetching contest data:', error);
        }
    };

    const fetchPaymentData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/prizes/recent?limit=50`);
            const data = await response.json();

            if (data.success) {
                setPaymentData(data.data);
            }
        } catch (error) {
            console.error('Error fetching payment data:', error);
        }
    };

    const formatWalletAddress = (address) => {
        if (!address) return 'N/A';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount, currency = 'XLM') => {
        return `${parseFloat(amount).toFixed(2)} ${currency}`;
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    const renderGlobalLeaderboard = () => (
        <div className="leaderboard-content">
            <div className="leaderboard-header">
                <h3>🏆 Global Leaderboard</h3>
                <div className="filter-controls">
                    <select
                        value={selectedAgeCategory}
                        onChange={(e) => setSelectedAgeCategory(e.target.value)}
                        className="age-filter"
                    >
                        {ageCategories.map(category => (
                            <option key={category} value={category}>
                                {category === 'all' ? 'All Ages' : `${category} years`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="leaderboard-table">
                <div className="table-header">
                    <div className="rank-col">Rank</div>
                    <div className="user-col">User</div>
                    <div className="distance-col">Total Distance</div>
                    <div className="contests-col">Contests</div>
                    <div className="earnings-col">Total Earnings</div>
                    <div className="nfts-col">NFTs</div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner">⏳</div>
                        <p>Loading leaderboard...</p>
                    </div>
                ) : (
                    <div className="table-body">
                        {leaderboardData.map((user, index) => (
                            <div key={user.wallet_address} className="table-row">
                                <div className="rank-col">
                                    <span className="rank-badge">
                                        {getRankIcon(user.rank_position || index + 1)}
                                    </span>
                                </div>
                                <div className="user-col">
                                    <div className="user-info">
                                        <div className="username">{user.username || 'Anonymous'}</div>
                                        <div className="wallet-address">{formatWalletAddress(user.wallet_address)}</div>
                                        {user.age_category && (
                                            <div className="age-category">{user.age_category}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="distance-col">
                                    <span className="distance-value">{user.total_distance?.toFixed(1) || '0.0'} km</span>
                                </div>
                                <div className="contests-col">
                                    <div className="contest-stats">
                                        <span className="total-contests">{user.total_contests || 0}</span>
                                        <span className="won-contests">({user.contests_won || 0} won)</span>
                                    </div>
                                </div>
                                <div className="earnings-col">
                                    <span className="earnings-value">{formatCurrency(user.total_earnings || 0)}</span>
                                </div>
                                <div className="nfts-col">
                                    <span className="nft-count">{user.nft_count || 0} 🎨</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderContestResults = () => (
        <div className="contest-results-content">
            <div className="section-header">
                <h3>🏁 Contest Results</h3>
                <p>View winners and results from completed contests</p>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner">⏳</div>
                    <p>Loading contest results...</p>
                </div>
            ) : (
                <div className="contest-results-grid">
                    {contestData.map((contest) => (
                        <div key={contest.id} className="contest-result-card">
                            <div className="contest-header">
                                <h4>{contest.title}</h4>
                                <div className="contest-meta">
                                    <span className="contest-date">{formatDate(contest.end_date)}</span>
                                    <span className="age-category">{contest.age_category}</span>
                                </div>
                            </div>

                            <div className="contest-stats">
                                <div className="stat">
                                    <span className="label">Participants</span>
                                    <span className="value">{contest.participant_count || 0}</span>
                                </div>
                                <div className="stat">
                                    <span className="label">Prize Pool</span>
                                    <span className="value">{formatCurrency(contest.prize_pool)}</span>
                                </div>
                                <div className="stat">
                                    <span className="label">Target Distance</span>
                                    <span className="value">{contest.target_distance} km</span>
                                </div>
                            </div>

                            <div className="contest-actions">
                                <button
                                    className="view-details-btn"
                                    onClick={() => fetchContestWinners(contest.id)}
                                >
                                    View Winners
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderPaymentHistory = () => (
        <div className="payment-history-content">
            <div className="section-header">
                <h3>💰 Payment History</h3>
                <p>Recent prize distributions and payments</p>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner">⏳</div>
                    <p>Loading payment history...</p>
                </div>
            ) : (
                <div className="payment-table">
                    <div className="table-header">
                        <div className="date-col">Date</div>
                        <div className="contest-col">Contest</div>
                        <div className="winner-col">Winner</div>
                        <div className="rank-col">Rank</div>
                        <div className="amount-col">Amount</div>
                        <div className="status-col">Status</div>
                    </div>

                    <div className="table-body">
                        {paymentData.map((payment) => (
                            <div key={payment.id} className="table-row">
                                <div className="date-col">
                                    {formatDate(payment.distribution_date)}
                                </div>
                                <div className="contest-col">
                                    <div className="contest-info">
                                        <div className="contest-title">{payment.contest_title}</div>
                                    </div>
                                </div>
                                <div className="winner-col">
                                    <div className="winner-info">
                                        <div className="username">{payment.winner_username || 'Anonymous'}</div>
                                        <div className="wallet-address">{formatWalletAddress(payment.winner_wallet)}</div>
                                    </div>
                                </div>
                                <div className="rank-col">
                                    <span className="rank-badge">
                                        {getRankIcon(payment.rank_position)}
                                    </span>
                                </div>
                                <div className="amount-col">
                                    <span className="amount-value">
                                        {formatCurrency(payment.prize_amount, payment.prize_type)}
                                    </span>
                                </div>
                                <div className="status-col">
                                    <span className={`status-badge ${payment.status}`}>
                                        {payment.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const fetchContestWinners = async (contestId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/contests/${contestId}/winners`);
            const data = await response.json();

            if (data.success) {
                // You can implement a modal or detailed view here
                console.log('Contest winners:', data.data);
                alert(`Winners for ${data.data.contest.title}:\n${data.data.winners.map(w => `${w.rank_position}. ${w.username}: ${w.current_distance}km`).join('\n')}`);
            }
        } catch (error) {
            console.error('Error fetching contest winners:', error);
        }
    };

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h2>📊 Leaderboard & Statistics</h2>
                <p>Track performance, contest results, and payment history</p>
            </div>

            <div className="leaderboard-tabs">
                <button
                    className={`tab ${activeTab === 'global' ? 'active' : ''}`}
                    onClick={() => setActiveTab('global')}
                >
                    🏆 Global Leaderboard
                </button>
                <button
                    className={`tab ${activeTab === 'contests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('contests')}
                >
                    🏁 Contest Results
                </button>
                <button
                    className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payments')}
                >
                    💰 Payment History
                </button>
            </div>

            <div className="leaderboard-body">
                {activeTab === 'global' && renderGlobalLeaderboard()}
                {activeTab === 'contests' && renderContestResults()}
                {activeTab === 'payments' && renderPaymentHistory()}
            </div>
        </div>
    );
};

export default Leaderboard;