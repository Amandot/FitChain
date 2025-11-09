import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './ContestCard.css';

const ContestCard = ({ contest, userAge, onJoin, isJoined }) => {
    const [showDetails, setShowDetails] = useState(false);

    const getProgressPercentage = () => {
        if (!isJoined) return 0;
        const totalDays = contest.duration;
        const daysElapsed = totalDays - contest.daysLeft;
        return Math.min((daysElapsed / totalDays) * 100, 100);
    };

    const getStatusColor = () => {
        if (!isJoined) return '#3B82F6';
        if (contest.status === 'completed') return '#10B981';
        if (contest.daysLeft <= 3) return '#F59E0B';
        return '#3B82F6';
    };

    const getRewardIcon = () => {
        if (contest.reward.includes('Champion')) return '🏆';
        if (contest.reward.includes('Warrior')) return '⚔️';
        if (contest.reward.includes('Master')) return '🥇';
        if (contest.reward.includes('Athlete')) return '💪';
        return '🎁';
    };

    const handleJoinClick = () => {
        if (userAge < 18) {
            alert('You must be 18 or older to join contests!');
            return;
        }
        onJoin(contest.id);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className={`contest-card ${isJoined ? 'joined' : ''}`}
        >
            <div className="contest-header">
                <div className="contest-badge">
                    <span className="age-category">{contest.ageCategory}</span>
                    <span className="duration">{contest.duration} days</span>
                </div>
                <div className="contest-status" style={{ color: getStatusColor() }}>
                    {isJoined ? (contest.status === 'completed' ? 'Completed' : 'Active') : 'Available'}
                </div>
            </div>

            <div className="contest-content">
                <h3 className="contest-title">{contest.title}</h3>
                <p className="contest-description">{contest.description}</p>

                <div className="contest-stats">
                    <div className="stat">
                        <span className="stat-label">Participants</span>
                        <span className="stat-value">{contest.participants.toLocaleString()}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Days Left</span>
                        <span className="stat-value">{contest.daysLeft}</span>
                    </div>
                </div>

                {isJoined && (
                    <div className="progress-section">
                        <div className="progress-header">
                            <span>Progress</span>
                            <span>{Math.round(getProgressPercentage())}%</span>
                        </div>
                        <div className="progress-bar">
                            <motion.div
                                className="progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${getProgressPercentage()}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                )}

                <div className="contest-requirements">
                    <h4>Requirements</h4>
                    <p>{contest.requirements}</p>
                </div>

                <div className="contest-reward">
                    <div className="reward-icon">{getRewardIcon()}</div>
                    <div className="reward-details">
                        <h4>Reward</h4>
                        <p>{contest.reward}</p>
                    </div>
                </div>
            </div>

            <div className="contest-actions">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="details-btn"
                >
                    {showDetails ? 'Hide Details' : 'View Details'}
                </button>

                {!isJoined ? (
                    <button
                        onClick={handleJoinClick}
                        className="join-btn"
                        disabled={userAge < 18}
                    >
                        {userAge < 18 ? 'Age Restricted' : 'Join Contest'}
                    </button>
                ) : (
                    <button className="joined-btn" disabled>
                        {contest.status === 'completed' ? 'Completed' : 'Joined'}
                    </button>
                )}
            </div>

            {showDetails && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="contest-details"
                >
                    <div className="detail-section">
                        <h5>Contest Rules</h5>
                        <ul>
                            <li>Must be {contest.ageCategory} years old to participate</li>
                            <li>Complete daily fitness tracking for {contest.duration} days</li>
                            <li>Meet minimum weekly distance requirements</li>
                            <li>GPS tracking must be accurate (within 50m)</li>
                            <li>No cheating or fake data allowed</li>
                        </ul>
                    </div>

                    <div className="detail-section">
                        <h5>Reward Details</h5>
                        <ul>
                            <li>Exclusive NFT minted on Ethereum blockchain</li>
                            <li>FIT tokens credited to your wallet</li>
                            <li>Leaderboard ranking and achievements</li>
                            <li>Access to premium features</li>
                        </ul>
                    </div>

                    <div className="detail-section">
                        <h5>Timeline</h5>
                        <div className="timeline">
                            <div className="timeline-item">
                                <span className="timeline-date">Day 1-7</span>
                                <span className="timeline-desc">Build consistency</span>
                            </div>
                            <div className="timeline-item">
                                <span className="timeline-date">Day 8-14</span>
                                <span className="timeline-desc">Maintain momentum</span>
                            </div>
                            <div className="timeline-item">
                                <span className="timeline-date">Day 15+</span>
                                <span className="timeline-desc">Earn rewards</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ContestCard;