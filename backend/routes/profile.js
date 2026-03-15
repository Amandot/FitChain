const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Ensure run_history table exists (migration-safe)
db.run(`CREATE TABLE IF NOT EXISTS run_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_address TEXT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    distance_meters REAL NOT NULL,
    duration_seconds INTEGER NOT NULL,
    avg_speed REAL,
    notes TEXT,
    FOREIGN KEY (wallet_address) REFERENCES users(wallet_address)
)`).catch(() => {});

// GET /api/profile/:walletAddress - full profile with stats
router.get('/:walletAddress', async (req, res) => {
    const { walletAddress } = req.params;
    try {
        const user = await db.get(
            'SELECT * FROM users WHERE LOWER(wallet_address) = LOWER(?)',
            [walletAddress]
        );
        if (!user) {
            // Return empty profile for new wallets
            return res.json({ success: true, data: { wallet_address: walletAddress, total_distance: 0, total_contests: 0, contests_won: 0, total_earnings: 0 } });
        }
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/profile/:walletAddress/runs - run history
router.get('/:walletAddress/runs', async (req, res) => {
    const { walletAddress } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    try {
        const runs = await db.all(
            `SELECT * FROM run_history WHERE LOWER(wallet_address) = LOWER(?)
             ORDER BY date DESC LIMIT ? OFFSET ?`,
            [walletAddress, parseInt(limit), parseInt(offset)]
        );
        const total = await db.get(
            'SELECT COUNT(*) as count FROM run_history WHERE LOWER(wallet_address) = LOWER(?)',
            [walletAddress]
        );
        res.json({ success: true, data: runs, total: total?.count || 0 });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/profile/:walletAddress/runs - save a run
router.post('/:walletAddress/runs', async (req, res) => {
    const { walletAddress } = req.params;
    const { distance_meters, duration_seconds, avg_speed, notes, date } = req.body;

    if (!distance_meters || !duration_seconds) {
        return res.status(400).json({ success: false, message: 'distance_meters and duration_seconds are required' });
    }

    try {
        // Upsert user so FK constraint is satisfied
        await db.run(
            `INSERT OR IGNORE INTO users (wallet_address) VALUES (?)`,
            [walletAddress]
        );

        const result = await db.run(
            `INSERT INTO run_history (wallet_address, distance_meters, duration_seconds, avg_speed, notes, date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [walletAddress, distance_meters, duration_seconds, avg_speed || null, notes || null, date || new Date().toISOString()]
        );

        // Update user aggregate stats
        await db.run(
            `UPDATE users SET total_distance = total_distance + ?, updated_at = CURRENT_TIMESTAMP
             WHERE LOWER(wallet_address) = LOWER(?)`,
            [distance_meters, walletAddress]
        );

        const run = await db.get('SELECT * FROM run_history WHERE id = ?', [result.id]);
        res.status(201).json({ success: true, data: run });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/profile/:walletAddress/contests - contest history
router.get('/:walletAddress/contests', async (req, res) => {
    const { walletAddress } = req.params;
    try {
        const contests = await db.all(
            `SELECT
                c.id, c.title, c.description, c.start_date, c.end_date,
                c.target_distance, c.prize_pool, c.status,
                cp.current_distance, cp.rank_position, cp.completed, cp.joined_at,
                pd.prize_amount, pd.prize_type
             FROM contest_participants cp
             JOIN contests c ON c.id = cp.contest_id
             LEFT JOIN prize_distributions pd
               ON pd.contest_id = cp.contest_id AND LOWER(pd.winner_wallet) = LOWER(cp.user_wallet)
             WHERE LOWER(cp.user_wallet) = LOWER(?)
             ORDER BY cp.joined_at DESC`,
            [walletAddress]
        );
        res.json({ success: true, data: contests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/profile/:walletAddress/runs/:runId
router.delete('/:walletAddress/runs/:runId', async (req, res) => {
    const { walletAddress, runId } = req.params;
    try {
        const run = await db.get(
            `SELECT * FROM run_history WHERE id = ? AND LOWER(wallet_address) = LOWER(?)`,
            [runId, walletAddress]
        );
        if (!run) return res.status(404).json({ success: false, message: 'Run not found' });

        await db.run(`DELETE FROM run_history WHERE id = ?`, [runId]);

        // Subtract from aggregate
        await db.run(
            `UPDATE users SET total_distance = MAX(0, total_distance - ?), updated_at = CURRENT_TIMESTAMP
             WHERE LOWER(wallet_address) = LOWER(?)`,
            [run.distance_meters, walletAddress]
        );

        res.json({ success: true, message: 'Run deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
