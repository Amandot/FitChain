const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const PrizeDistribution = require('../models/PrizeDistribution');
const PaymentHistory = require('../models/PaymentHistory');

// Get all contests with filters
router.get('/', async (req, res) => {
    try {
        const { status, age_category, limit } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (age_category) filters.age_category = age_category;
        if (limit) filters.limit = parseInt(limit);

        const contests = await Contest.findAll(filters);

        res.json({
            success: true,
            data: contests,
            total: contests.length
        });
    } catch (error) {
        console.error('Error fetching contests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contests',
            error: error.message
        });
    }
});

// Get contest by ID with detailed information
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const contest = await Contest.findById(id);
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        const participants = await Contest.getParticipants(id);
        const leaderboard = await Contest.getLeaderboard(id);
        const prizeDistributions = await PrizeDistribution.findByContest(id);
        const payments = await PaymentHistory.findByContest(id);

        res.json({
            success: true,
            data: {
                contest,
                participants,
                leaderboard,
                prizeDistributions,
                payments
            }
        });
    } catch (error) {
        console.error('Error fetching contest details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contest details',
            error: error.message
        });
    }
});

// Get contest winners
router.get('/:id/winners', async (req, res) => {
    try {
        const { id } = req.params;
        const { top = 3 } = req.query;

        const contest = await Contest.findById(id);
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        const winners = await Contest.getWinners(id, parseInt(top));
        const prizeDistributions = await PrizeDistribution.findByContest(id);

        res.json({
            success: true,
            data: {
                contest: {
                    id: contest.id,
                    title: contest.title,
                    status: contest.status,
                    end_date: contest.end_date
                },
                winners,
                prizeDistributions
            }
        });
    } catch (error) {
        console.error('Error fetching contest winners:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contest winners',
            error: error.message
        });
    }
});

// Get active contests
router.get('/status/active', async (req, res) => {
    try {
        const contests = await Contest.getActiveContests();

        res.json({
            success: true,
            data: contests
        });
    } catch (error) {
        console.error('Error fetching active contests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active contests',
            error: error.message
        });
    }
});

// Get upcoming contests
router.get('/status/upcoming', async (req, res) => {
    try {
        const contests = await Contest.getUpcomingContests();

        res.json({
            success: true,
            data: contests
        });
    } catch (error) {
        console.error('Error fetching upcoming contests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming contests',
            error: error.message
        });
    }
});

// Get completed contests
router.get('/status/completed', async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const contests = await Contest.getCompletedContests(parseInt(limit));

        res.json({
            success: true,
            data: contests
        });
    } catch (error) {
        console.error('Error fetching completed contests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch completed contests',
            error: error.message
        });
    }
});

// Get contest payment summary
router.get('/:id/payments', async (req, res) => {
    try {
        const { id } = req.params;

        const contest = await Contest.findById(id);
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        const payments = await PaymentHistory.findByContest(id);
        const paymentSummary = await PaymentHistory.getContestPayments(id);
        const prizesSummary = await PrizeDistribution.getContestSummary(id);

        res.json({
            success: true,
            data: {
                contest: {
                    id: contest.id,
                    title: contest.title,
                    prize_pool: contest.prize_pool,
                    entry_fee: contest.entry_fee
                },
                payments,
                paymentSummary,
                prizesSummary
            }
        });
    } catch (error) {
        console.error('Error fetching contest payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contest payments',
            error: error.message
        });
    }
});

module.exports = router;