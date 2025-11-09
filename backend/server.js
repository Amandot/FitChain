const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./config/database');

// Import routes
const leaderboardRoutes = require('./routes/leaderboard');
const contestRoutes = require('./routes/contests');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});

app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Stellar Strider API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/payments', paymentRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Stellar Strider API',
        version: '1.0.0',
        endpoints: {
            leaderboard: {
                global: 'GET /api/leaderboard/global',
                contest: 'GET /api/leaderboard/contest/:contestId',
                userRank: 'GET /api/leaderboard/user/:walletAddress/rank',
                topPerformers: 'GET /api/leaderboard/top-performers',
                topEarners: 'GET /api/leaderboard/top-earners'
            },
            contests: {
                all: 'GET /api/contests',
                byId: 'GET /api/contests/:id',
                winners: 'GET /api/contests/:id/winners',
                active: 'GET /api/contests/status/active',
                upcoming: 'GET /api/contests/status/upcoming',
                completed: 'GET /api/contests/status/completed',
                payments: 'GET /api/contests/:id/payments'
            },
            payments: {
                all: 'GET /api/payments',
                byId: 'GET /api/payments/:id',
                byWallet: 'GET /api/payments/wallet/:walletAddress',
                recent: 'GET /api/payments/recent/all',
                pending: 'GET /api/payments/status/pending',
                volume: 'GET /api/payments/stats/volume',
                prizes: 'GET /api/payments/prizes/all',
                recentPrizes: 'GET /api/payments/prizes/recent',
                pendingPrizes: 'GET /api/payments/prizes/pending',
                userPrizes: 'GET /api/payments/prizes/user/:walletAddress'
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database
        await db.initialize();
        console.log('Database initialized successfully');

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Stellar Strider API server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
            console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
            console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    try {
        await db.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down server...');
    try {
        await db.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

startServer();