const db = require('../config/database');

class PaymentHistory {
    static async create(paymentData) {
        const {
            from_wallet,
            to_wallet,
            amount,
            currency,
            transaction_type,
            contest_id,
            transaction_hash,
            stellar_operation_id
        } = paymentData;

        const sql = `
            INSERT INTO payment_history (
                from_wallet, to_wallet, amount, currency, transaction_type,
                contest_id, transaction_hash, stellar_operation_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            const result = await db.run(sql, [
                from_wallet, to_wallet, amount, currency, transaction_type,
                contest_id, transaction_hash, stellar_operation_id
            ]);
            return await this.findById(result.id);
        } catch (error) {
            throw new Error(`Failed to create payment record: ${error.message}`);
        }
    }

    static async findById(id) {
        const sql = `
            SELECT ph.*, c.title as contest_title,
                   u1.username as from_username,
                   u2.username as to_username
            FROM payment_history ph
            LEFT JOIN contests c ON ph.contest_id = c.id
            LEFT JOIN users u1 ON ph.from_wallet = u1.wallet_address
            LEFT JOIN users u2 ON ph.to_wallet = u2.wallet_address
            WHERE ph.id = ?
        `;
        return await db.get(sql, [id]);
    }

    static async findByWallet(wallet_address, limit = 50) {
        const sql = `
            SELECT ph.*, c.title as contest_title,
                   u1.username as from_username,
                   u2.username as to_username
            FROM payment_history ph
            LEFT JOIN contests c ON ph.contest_id = c.id
            LEFT JOIN users u1 ON ph.from_wallet = u1.wallet_address
            LEFT JOIN users u2 ON ph.to_wallet = u2.wallet_address
            WHERE ph.from_wallet = ? OR ph.to_wallet = ?
            ORDER BY ph.created_at DESC
            LIMIT ?
        `;
        return await db.all(sql, [wallet_address, wallet_address, limit]);
    }

    static async findByContest(contest_id) {
        const sql = `
            SELECT ph.*, c.title as contest_title,
                   u1.username as from_username,
                   u2.username as to_username
            FROM payment_history ph
            LEFT JOIN contests c ON ph.contest_id = c.id
            LEFT JOIN users u1 ON ph.from_wallet = u1.wallet_address
            LEFT JOIN users u2 ON ph.to_wallet = u2.wallet_address
            WHERE ph.contest_id = ?
            ORDER BY ph.created_at DESC
        `;
        return await db.all(sql, [contest_id]);
    }

    static async updateStatus(id, status, completed_at = null, failure_reason = null) {
        let sql = 'UPDATE payment_history SET status = ?';
        const params = [status];

        if (completed_at) {
            sql += ', completed_at = ?';
            params.push(completed_at);
        }

        if (failure_reason) {
            sql += ', failure_reason = ?';
            params.push(failure_reason);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        return await db.run(sql, params);
    }

    static async getAllPayments(filters = {}) {
        let sql = `
            SELECT ph.*, c.title as contest_title,
                   u1.username as from_username,
                   u2.username as to_username
            FROM payment_history ph
            LEFT JOIN contests c ON ph.contest_id = c.id
            LEFT JOIN users u1 ON ph.from_wallet = u1.wallet_address
            LEFT JOIN users u2 ON ph.to_wallet = u2.wallet_address
            WHERE 1=1
        `;

        const params = [];

        if (filters.status) {
            sql += ' AND ph.status = ?';
            params.push(filters.status);
        }

        if (filters.transaction_type) {
            sql += ' AND ph.transaction_type = ?';
            params.push(filters.transaction_type);
        }

        if (filters.contest_id) {
            sql += ' AND ph.contest_id = ?';
            params.push(filters.contest_id);
        }

        if (filters.currency) {
            sql += ' AND ph.currency = ?';
            params.push(filters.currency);
        }

        if (filters.date_from) {
            sql += ' AND ph.created_at >= ?';
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            sql += ' AND ph.created_at <= ?';
            params.push(filters.date_to);
        }

        sql += ' ORDER BY ph.created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
        }

        return await db.all(sql, params);
    }

    static async getPaymentSummary(wallet_address) {
        const sql = `
            SELECT 
                transaction_type,
                currency,
                COUNT(*) as transaction_count,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount
            FROM payment_history
            WHERE from_wallet = ? OR to_wallet = ?
            GROUP BY transaction_type, currency
            ORDER BY transaction_type, currency
        `;
        return await db.all(sql, [wallet_address, wallet_address]);
    }

    static async getContestPayments(contest_id) {
        const sql = `
            SELECT 
                transaction_type,
                COUNT(*) as transaction_count,
                SUM(amount) as total_amount,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
            FROM payment_history
            WHERE contest_id = ?
            GROUP BY transaction_type
            ORDER BY transaction_type
        `;
        return await db.all(sql, [contest_id]);
    }

    static async getPendingPayments() {
        const sql = `
            SELECT ph.*, c.title as contest_title,
                   u1.username as from_username,
                   u2.username as to_username
            FROM payment_history ph
            LEFT JOIN contests c ON ph.contest_id = c.id
            LEFT JOIN users u1 ON ph.from_wallet = u1.wallet_address
            LEFT JOIN users u2 ON ph.to_wallet = u2.wallet_address
            WHERE ph.status = 'pending'
            ORDER BY ph.created_at ASC
        `;
        return await db.all(sql);
    }

    static async getRecentPayments(limit = 20) {
        const sql = `
            SELECT ph.*, c.title as contest_title,
                   u1.username as from_username,
                   u2.username as to_username
            FROM payment_history ph
            LEFT JOIN contests c ON ph.contest_id = c.id
            LEFT JOIN users u1 ON ph.from_wallet = u1.wallet_address
            LEFT JOIN users u2 ON ph.to_wallet = u2.wallet_address
            WHERE ph.status = 'completed'
            ORDER BY ph.completed_at DESC
            LIMIT ?
        `;
        return await db.all(sql, [limit]);
    }

    static async getTotalVolume(date_from = null, date_to = null) {
        let sql = `
            SELECT 
                currency,
                COUNT(*) as total_transactions,
                SUM(amount) as total_volume,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_volume
            FROM payment_history
            WHERE 1=1
        `;

        const params = [];

        if (date_from) {
            sql += ' AND created_at >= ?';
            params.push(date_from);
        }

        if (date_to) {
            sql += ' AND created_at <= ?';
            params.push(date_to);
        }

        sql += ' GROUP BY currency ORDER BY completed_volume DESC';

        return await db.all(sql, params);
    }
}

module.exports = PaymentHistory;