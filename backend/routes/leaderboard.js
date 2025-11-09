const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Contest = require('../models/Contest');
const PrizeDistribution = require('../models/PrizeDistribution');

// Get global leaderboard
router.get('/global', async (req, res) => {
    try {
        const { limit = 50, age_category } = req.query;

        let leaderboard;
        if (age_category) {
            leaderboard = await User.getTopPerformers(age_category, parseInt(limit));
        } else {
            leaderboard = await User.getGlobalLeaderboard(parseInt(limit));
        }

        res.json({
            success: true,
            data: leaderboard,
            total: leaderboard.length
        });
    } catch (error) {
        console.error('Error fetching global leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch global leaderboard',
            error: error.message
        });
    }
});

// Get contest leaderboard
router.get('/contest/:contestId', async (req, res) => {
    try {
        const { contestId } = req.params;
        const { limit = 50 } = req.query;

        const leaderboard = await Contest.getLeaderboard(contestId, parseInt(limit));
        const contest = await Contest.findById(contestId);

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        res.json({
            success: true,
            data: {
                contest: contest,
                leaderboard: leaderboard
            }
        });
    } catch (error) {
        console.error('Error fetching contest leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contest leaderboard',
            error: error.message
        });
    }
});

// Get user rank in global leaderboard
router.get('/user/:walletAddress/rank', async (req, res) => {
    try {
        const { walletAddress } = req.params;

        const rank = await User.getUserRank(walletAddress);
        const user = await User.findByWallet(walletAddress);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: user,
                rank: rank || 'Unranked'
            }
        });
    } catch (error) {
        console.error('Error fetching user rank:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user rank',
            error: error.message
        });
    }
});

// Get top performers by age category
router.get('/top-performers', async (req, res) => {
    try {
        const { age_category, limit = 10 } = req.query;

        const performers = await User.getTopPerformers(age_category, parseInt(limit));

        res.json({
            success: true,
            data: performers,
            filters: {
                age_category: age_category || 'all',
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching top performers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch top performers',
            error: error.message
        });
    }
});

// Get top earners
router.get('/top-earners', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const earners = await PrizeDistribution.getTopEarners(parseInt(limit));

        res.json({
            success: true,
            data: earners
        });
    } catch (error) {
        console.error('Error fetching top earners:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch top earners',
            error: error.message
        });
    }
});

module.exports = router;