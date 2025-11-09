const db = require('../config/database');

class PrizeDistribution {
    static async create(distributionData) {
        const {
            contest_id,
            winner_wallet,
            winner_username,
            rank_position,
            prize_amount,
            prize_type,
            transaction_hash,
            notes
        } = distributionData;

        const sql = `
            INSERT INTO prize_distributions (
                contest_id, winner_wallet, winner_username, rank_position,
                prize_amount, prize_type, transaction_hash, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            const result = await db.run(sql, [
                contest_id, winner_wallet, winner_username, rank_position,
                prize_amount, prize_type, transaction_hash, notes
            ]);
            return await this.findById(result.id);
        } catch (error) {
            throw new Error(`Failed to create prize distribution: ${error.message}`);
        }
    }

    static async findById(id) {
        const sql = `
            SELECT pd.*, c.title as contest_title, c.end_date as contest_end_date
            FROM prize_distributions pd
            JOIN contests c ON pd.contest_id = c.id
            WHERE pd.id = ?
        `;
        return await db.get(sql, [id]);
    }

    static async findByContest(contest_id) {
        const sql = `
            SELECT pd.*, c.title as contest_title
            FROM prize_distributions pd
            JOIN contests c ON pd.contest_id = c.id
            WHERE pd.contest_id = ?
            ORDER BY pd.rank_position ASC
        `;
        return await db.all(sql, [contest_id]);
    }

    static async findByUser(user_wallet, limit = 20) {
        const sql = `
            SELECT pd.*, c.title as contest_title, c.end_date as contest_end_date
            FROM prize_distributions pd
            JOIN contests c ON pd.contest_id = c.id
            WHERE pd.winner_wallet = ?
            ORDER BY pd.distribution_date DESC
            LIMIT ?
        `;
        return await db.all(sql, [user_wallet, limit]);
    }

    static async updateStatus(id, status, transaction_hash = null) {
        let sql = 'UPDATE prize_distributions SET status = ?';
        const params = [status];

        if (transaction_hash) {
            sql += ', transaction_hash = ?';
            params.push(transaction_hash);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        return await db.run(sql, params);
    }

    static async getAllDistributions(filters = {}) {
        let sql = `
            SELECT pd.*, c.title as contest_title, c.end_date as contest_end_date,
                   u.username
            FROM prize_distributions pd
            JOIN contests c ON pd.contest_id = c.id
            LEFT JOIN users u ON pd.winner_wallet = u.wallet_address
            WHERE 1=1
        `;

        const params = [];

        if (filters.status) {
            sql += ' AND pd.status = ?';
            params.push(filters.status);
        }

        if (filters.contest_id) {
            sql += ' AND pd.contest_id = ?';
            params.push(filters.contest_id);
        }

        if (filters.prize_type) {
            sql += ' AND pd.prize_type = ?';
            params.push(filters.prize_type);
        }

        sql += ' ORDER BY pd.distribution_date DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
        }

        return await db.all(sql, params);
    }

    static async getTotalEarnings(user_wallet) {
        const sql = `
            SELECT 
                COUNT(*) as total_prizes,
                SUM(CASE WHEN status = 'completed' THEN prize_amount ELSE 0 END) as total_earnings,
                SUM(CASE WHEN status = 'pending' THEN prize_amount ELSE 0 END) as pending_earnings
            FROM prize_distributions
            WHERE winner_wallet = ?
        `;
        return await db.get(sql, [user_wallet]);
    }

    static async getTopEarners(limit = 10) {
        const sql = `
            SELECT 
                pd.winner_wallet,
                pd.winner_username,
                COUNT(*) as total_prizes,
                SUM(pd.prize_amount) as total_earnings,
                COUNT(DISTINCT pd.contest_id) as contests_won
            FROM prize_distributions pd
            WHERE pd.status = 'completed'
            GROUP BY pd.winner_wallet
            ORDER BY total_earnings DESC, contests_won DESC
            LIMIT ?
        `;
        return await db.all(sql, [limit]);
    }

    static async getRecentDistributions(limit = 20) {
        const sql = `
            SELECT pd.*, c.title as contest_title, u.username
            FROM prize_distributions pd
            JOIN contests c ON pd.contest_id = c.id
            LEFT JOIN users u ON pd.winner_wallet = u.wallet_address
            WHERE pd.status = 'completed'
            ORDER BY pd.distribution_date DESC
            LIMIT ?
        `;
        return await db.all(sql, [limit]);
    }

    static async getPendingDistributions() {
        const sql = `
            SELECT pd.*, c.title as contest_title, u.username
            FROM prize_distributions pd
            JOIN contests c ON pd.contest_id = c.id
            LEFT JOIN users u ON pd.winner_wallet = u.wallet_address
            WHERE pd.status = 'pending'
            ORDER BY pd.distribution_date ASC
        `;
        return await db.all(sql);
    }

    static async getContestSummary(contest_id) {
        const sql = `
            SELECT 
                COUNT(*) as total_winners,
                SUM(prize_amount) as total_distributed,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_distributions,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_distributions
            FROM prize_distributions
            WHERE contest_id = ?
        `;
        return await db.get(sql, [contest_id]);
    }
}

module.exports = PrizeDistribution;