import React from 'react';
import { motion } from 'framer-motion';
import './UserStats.css';

const UserStats = ({ stats }) => {
    const statItems = [
        {
            label: 'Total Distance',
            value: `${stats.totalDistance} km`,
            icon: '🏃‍♂️',
            color: '#3B82F6'
        },
        {
            label: 'Workouts',
            value: stats.totalWorkouts,
            icon: '💪',
            color: '#10B981'
        },
        {
            label: 'Current Streak',
            value: `${stats.currentStreak} days`,
            icon: '🔥',
            color: '#F59E0B'
        },
        {
            label: 'NFTs Earned',
            value: stats.nftsEarned,
            icon: '🏆',
            color: '#D4AF37'
        },
        {
            label: 'FIT Tokens',
            value: stats.tokensEarned,
            icon: '🪙',
            color: '#8B5CF6'
        },
        {
            label: 'Global Rank',
            value: `#${stats.rank}`,
            icon: '📊',
            color: '#EF4444'
        }
    ];

    return (
        <div className="user-stats">
            <h3 className="stats-title">Your Fitness Stats</h3>
            <div className="stats-grid">
                {statItems.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="stat-card"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="stat-icon" style={{ color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <div className="stat-value" style={{ color: stat.color }}>
                                {stat.value}
                            </div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default UserStats;