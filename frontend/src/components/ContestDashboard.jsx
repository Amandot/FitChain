import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContestCard from './ContestCard';
import UserStats from './UserStats';
import NFTRewards from './NFTRewards';
import './ContestDashboard.css';

const ContestDashboard = ({ userProfile, contests, allContests, onEditProfile }) => {
    const [activeTab, setActiveTab] = useState('completed');
    const [joinedContests, setJoinedContests] = useState([]);
    const [userStats, setUserStats] = useState({
        totalDistance: 0,
        totalWorkouts: 0,
        currentStreak: 0,
        nftsEarned: 0,
        tokensEarned: 0,
        rank: 0
    });

    useEffect(() => {
        // Load user's joined contests and stats
        loadUserData();
    }, []);

    const loadUserData = () => {
        // In real app, fetch from blockchain/API
        const savedContests = localStorage.getItem('fitchain_joined_contests');
        if (savedContests) {
            setJoinedContests(JSON.parse(savedContests));
        }

        // Sample user stats
        setUserStats({
            totalDistance: 127.5,
            totalWorkouts: 23,
            currentStreak: 7,
            nftsEarned: 2,
            tokensEarned: 350,
            rank: 156
        });
    };

    const handleJoinContest = (contestId) => {
        const contest = contests.find(c => c.id === contestId);
        if (contest) {
            const newJoinedContest = {
                ...contest,
                joinedAt: new Date().toISOString(),
                progress: 0,
                status: 'active'
            };

            const updatedJoined = [...joinedContests, newJoinedContest];
            setJoinedContests(updatedJoined);
            localStorage.setItem('fitchain_joined_contests', JSON.stringify(updatedJoined));
        }
    };

    const getAgeCategory = (age) => {
        if (age >= 18 && age <= 25) return '18-25';
        if (age >= 26 && age <= 35) return '26-35';
        if (age >= 36 && age <= 50) return '36-50';
        if (age >= 51) return '50+';
        return 'Unknown';
    };

    const availableContests = contests.filter(
        contest => !joinedContests.some(joined => joined.id === contest.id)
    );

    const completedContests = joinedContests.filter(contest => contest.status === 'completed');

    return (
        <div className="contest-dashboard">
            {/* User Profile Summary */}
            <div className="profile-summary">
                <div className="profile-info">
                    <div className="avatar">
                        {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="user-details">
                        <h3>{userProfile?.username || 'Anonymous User'}</h3>
                        <p>Age: {userProfile?.age} • Category: {getAgeCategory(userProfile?.age)}</p>
                        <p>Level: {userProfile?.fitnessLevel || 'Not set'}</p>
                    </div>
                </div>
                <button onClick={onEditProfile} className="edit-profile-btn">
                    Edit Profile
                </button>
            </div>

            {/* User Stats */}
            <UserStats stats={userStats} />

            {/* Contest Tabs */}
            <div className="contest-tabs">
                <button
                    className={`tab ${activeTab === 'available' ? 'active' : ''}`}
                    onClick={() => setActiveTab('available')}
                >
                    Available Contests ({availableContests.length})
                </button>
                <button
                    className={`tab ${activeTab === 'joined' ? 'active' : ''}`}
                    onClick={() => setActiveTab('joined')}
                >
                    My Contests ({joinedContests.length})
                </button>
                <button
                    className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed Contests (1)
                </button>
                <button
                    className={`tab ${activeTab === 'rewards' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rewards')}
                >
                    NFT Rewards ({userStats.nftsEarned})
                </button>
            </div>

            {/* Contest Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'available' && (
                    <motion.div
                        key="available"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="contest-grid"
                    >
                        {availableContests.length > 0 ? (
                            availableContests.map(contest => (
                                <ContestCard
                                    key={contest.id}
                                    contest={contest}
                                    userAge={userProfile?.age}
                                    onJoin={handleJoinContest}
                                    isJoined={false}
                                />
                            ))
                        ) : (
                            <div className="no-contests">
                                <h3>No Available Contests</h3>
                                <p>All contests for your age category have been joined!</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'joined' && (
                    <motion.div
                        key="joined"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="contest-grid"
                    >
                        {joinedContests.length > 0 ? (
                            joinedContests.map(contest => (
                                <ContestCard
                                    key={contest.id}
                                    contest={contest}
                                    userAge={userProfile?.age}
                                    onJoin={handleJoinContest}
                                    isJoined={true}
                                />
                            ))
                        ) : (
                            <div className="no-contests">
                                <h3>No Joined Contests</h3>
                                <p>Join a contest to start earning NFT rewards!</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'completed' && (
                    <motion.div
                        key="completed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="completed-contests-section"
                    >
                        <div className="completed-contest-card">
                            <div className="contest-header">
                                <div className="contest-status">
                                    <span className="status-badge completed">✅ Completed</span>
                                    <span className="completion-date">Completed: Oct 20, 2024</span>
                                </div>
                                <h3>🏃‍♂️ Mumbai Marathon Challenge</h3>
                                <p>Complete 21km marathon challenge in Mumbai area</p>
                            </div>

                            <div className="contest-results">
                                <div className="winner-section">
                                    <div className="winner-badge">
                                        <span className="crown">👑</span>
                                        <div className="winner-info">
                                            <h4>Champion: Sahil Kumar</h4>
                                            <p>Distance: 21.5 km • Prize: 300 XLM</p>
                                            <p className="winner-location">📍 Mumbai, Maharashtra</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="contest-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">Total Participants</span>
                                        <span className="stat-value">156</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Prize Pool</span>
                                        <span className="stat-value">500 XLM</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Target Distance</span>
                                        <span className="stat-value">21 km</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Duration</span>
                                        <span className="stat-value">7 days</span>
                                    </div>
                                </div>

                                <div className="top-performers">
                                    <h5>🏆 Top Performers</h5>
                                    <div className="performers-list">
                                        <div className="performer-item rank-1">
                                            <span className="rank">🥇</span>
                                            <span className="name">Sahil Kumar</span>
                                            <span className="distance">21.5 km</span>
                                            <span className="prize">300 XLM</span>
                                        </div>
                                        <div className="performer-item rank-2">
                                            <span className="rank">🥈</span>
                                            <span className="name">Priya Sharma</span>
                                            <span className="distance">21.2 km</span>
                                            <span className="prize">150 XLM</span>
                                        </div>
                                        <div className="performer-item rank-3">
                                            <span className="rank">🥉</span>
                                            <span className="name">Arjun Patel</span>
                                            <span className="distance">21.0 km</span>
                                            <span className="prize">50 XLM</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="contest-actions">
                                    <button className="view-full-leaderboard-btn">
                                        📊 View Full Leaderboard
                                    </button>
                                    <button className="view-transactions-btn">
                                        💰 View Prize Transactions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'rewards' && (
                    <motion.div
                        key="rewards"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <NFTRewards
                            userStats={userStats}
                            completedContests={completedContests}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Age Category Info */}
            {userProfile && (
                <div className="age-category-info">
                    <h4>Your Competition Category</h4>
                    <div className="category-card">
                        <span className="category-badge">{getAgeCategory(userProfile.age)}</span>
                        <p>You compete with users in your age group for fair competition</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContestDashboard;