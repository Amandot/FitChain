const express = require('express');
const router = express.Router();
const PaymentHistory = require('../models/PaymentHistory');
const PrizeDistribution = require('../models/PrizeDistribution');

// Get all payments with filters
router.get('/', async (req, res) => {
    try {
        const {
            status,
            transaction_type,
            contest_id,
            currency,
            date_from,
            date_to,
            limit = 50
        } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (transaction_type) filters.transaction_type = transaction_type;
        if (contest_id) filters.contest_id = contest_id;
        if (currency) filters.currency = currency;
        if (date_from) filters.date_from = date_from;
        if (date_to) filters.date_to = date_to;
        if (limit) filters.limit = parseInt(limit);

        const payments = await PaymentHistory.getAllPayments(filters);

        res.json({
            success: true,
            data: payments,
            filters
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payments',
            error: error.message
        });
    }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await PaymentHistory.findById(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment',
            error: error.message
        });
    }
});

// Get payments for a specific wallet
router.get('/wallet/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { limit = 50 } = req.query;

        const payments = await PaymentHistory.findByWallet(walletAddress, parseInt(limit));
        const summary = await PaymentHistory.getPaymentSummary(walletAddress);

        res.json({
            success: true,
            data: {
                payments,
                summary
            }
        });
    } catch (error) {
        console.error('Error fetching wallet payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wallet payments',
            error: error.message
        });
    }
});

// Get recent payments
router.get('/recent/all', async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const payments = await PaymentHistory.getRecentPayments(parseInt(limit));

        res.json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Error fetching recent payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent payments',
            error: error.message
        });
    }
});

// Get pending payments
router.get('/status/pending', async (req, res) => {
    try {
        const payments = await PaymentHistory.getPendingPayments();

        res.json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Error fetching pending payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending payments',
            error: error.message
        });
    }
});

// Get payment volume statistics
router.get('/stats/volume', async (req, res) => {
    try {
        const { date_from, date_to } = req.query;

        const volume = await PaymentHistory.getTotalVolume(date_from, date_to);

        res.json({
            success: true,
            data: volume,
            period: {
                from: date_from || 'all time',
                to: date_to || 'now'
            }
        });
    } catch (error) {
        console.error('Error fetching payment volume:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment volume',
            error: error.message
        });
    }
});

// Get prize distributions
router.get('/prizes/all', async (req, res) => {
    try {
        const {
            status,
            contest_id,
            prize_type,
            limit = 50
        } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (contest_id) filters.contest_id = contest_id;
        if (prize_type) filters.prize_type = prize_type;
        if (limit) filters.limit = parseInt(limit);

        const distributions = await PrizeDistribution.getAllDistributions(filters);

        res.json({
            success: true,
            data: distributions,
            filters
        });
    } catch (error) {
        console.error('Error fetching prize distributions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch prize distributions',
            error: error.message
        });
    }
});

// Get recent prize distributions
router.get('/prizes/recent', async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const distributions = await PrizeDistribution.getRecentDistributions(parseInt(limit));

        res.json({
            success: true,
            data: distributions
        });
    } catch (error) {
        console.error('Error fetching recent distributions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent distributions',
            error: error.message
        });
    }
});

// Get pending prize distributions
router.get('/prizes/pending', async (req, res) => {
    try {
        const distributions = await PrizeDistribution.getPendingDistributions();

        res.json({
            success: true,
            data: distributions
        });
    } catch (error) {
        console.error('Error fetching pending distributions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending distributions',
            error: error.message
        });
    }
});

// Get user's prize history
router.get('/prizes/user/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { limit = 20 } = req.query;

        const prizes = await PrizeDistribution.findByUser(walletAddress, parseInt(limit));
        const earnings = await PrizeDistribution.getTotalEarnings(walletAddress);

        res.json({
            success: true,
            data: {
                prizes,
                earnings
            }
        });
    } catch (error) {
        console.error('Error fetching user prizes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user prizes',
            error: error.message
        });
    }
});

module.exports = router;