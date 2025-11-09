const db = require('../config/database');

class Contest {
    static async create(contestData) {
        const {
            title,
            description,
            age_category,
            start_date,
            end_date,
            duration_days,
            target_distance,
            entry_fee,
            prize_pool,
            max_participants,
            created_by
        } = contestData;

        const sql = `
            INSERT INTO contests (
                title, description, age_category, start_date, end_date,
                duration_days, target_distance, entry_fee, prize_pool,
                max_participants, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            const result = await db.run(sql, [
                title, description, age_category, start_date, end_date,
                duration_days, target_distance, entry_fee, prize_pool,
                max_participants, created_by
            ]);
            return await this.findById(result.id);
        } catch (error) {
            throw new Error(`Failed to create contest: ${error.message}`);
        }
    }

    static async findById(id) {
        const sql = `
            SELECT c.*, u.username as creator_username,
                   COUNT(cp.id) as participant_count
            FROM contests c
            LEFT JOIN users u ON c.created_by = u.wallet_address
            LEFT JOIN contest_participants cp ON c.id = cp.contest_id
            WHERE c.id = ?
            GROUP BY c.id
        `;
        return await db.get(sql, [id]);
    }

    static async findAll(filters = {}) {
        let sql = `
            SELECT c.*, u.username as creator_username,
                   COUNT(cp.id) as participant_count
            FROM contests c
            LEFT JOIN users u ON c.created_by = u.wallet_address
            LEFT JOIN contest_participants cp ON c.id = cp.contest_id
            WHERE 1=1
        `;

        const params = [];

        if (filters.status) {
            sql += ' AND c.status = ?';
            params.push(filters.status);
        }

        if (filters.age_category) {
            sql += ' AND c.age_category = ?';
            params.push(filters.age_category);
        }

        sql += ' GROUP BY c.id ORDER BY c.created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
        }

        return await db.all(sql, params);
    }

    static async updateStatus(id, status) {
        const sql = 'UPDATE contests SET status = ? WHERE id = ?';
        return await db.run(sql, [status, id]);
    }

    static async joinContest(contest_id, user_wallet) {
        const sql = `
            INSERT INTO contest_participants (contest_id, user_wallet)
            VALUES (?, ?)
        `;

        try {
            return await db.run(sql, [contest_id, user_wallet]);
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('User already joined this contest');
            }
            throw error;
        }
    }

    static async getParticipants(contest_id) {
        const sql = `
            SELECT cp.*, u.username, u.age_category
            FROM contest_participants cp
            JOIN users u ON cp.user_wallet = u.wallet_address
            WHERE cp.contest_id = ?
            ORDER BY cp.current_distance DESC, cp.joined_at ASC
        `;
        return await db.all(sql, [contest_id]);
    }

    static async updateParticipantDistance(contest_id, user_wallet, distance) {
        const sql = `
            UPDATE contest_participants 
            SET current_distance = ?, last_update = CURRENT_TIMESTAMP
            WHERE contest_id = ? AND user_wallet = ?
        `;
        return await db.run(sql, [distance, contest_id, user_wallet]);
    }

    static async getLeaderboard(contest_id, limit = 50) {
        const sql = `
            SELECT 
                cp.user_wallet,
                u.username,
                cp.current_distance,
                cp.completed,
                ROW_NUMBER() OVER (ORDER BY cp.current_distance DESC) as rank_position,
                cp.last_update
            FROM contest_participants cp
            JOIN users u ON cp.user_wallet = u.wallet_address
            WHERE cp.contest_id = ?
            ORDER BY cp.current_distance DESC
            LIMIT ?
        `;
        return await db.all(sql, [contest_id, limit]);
    }

    static async getWinners(contest_id, top_count = 3) {
        const sql = `
            SELECT 
                cp.user_wallet,
                u.username,
                cp.current_distance,
                ROW_NUMBER() OVER (ORDER BY cp.current_distance DESC) as rank_position
            FROM contest_participants cp
            JOIN users u ON cp.user_wallet = u.wallet_address
            WHERE cp.contest_id = ? AND cp.current_distance > 0
            ORDER BY cp.current_distance DESC
            LIMIT ?
        `;
        return await db.all(sql, [contest_id, top_count]);
    }

    static async getActiveContests() {
        const sql = `
            SELECT c.*, COUNT(cp.id) as participant_count
            FROM contests c
            LEFT JOIN contest_participants cp ON c.id = cp.contest_id
            WHERE c.status = 'active' AND c.end_date > datetime('now')
            GROUP BY c.id
            ORDER BY c.end_date ASC
        `;
        return await db.all(sql);
    }

    static async getUpcomingContests() {
        const sql = `
            SELECT c.*, COUNT(cp.id) as participant_count
            FROM contests c
            LEFT JOIN contest_participants cp ON c.id = cp.contest_id
            WHERE c.status = 'upcoming' AND c.start_date > datetime('now')
            GROUP BY c.id
            ORDER BY c.start_date ASC
        `;
        return await db.all(sql);
    }

    static async getCompletedContests(limit = 20) {
        const sql = `
            SELECT c.*, COUNT(cp.id) as participant_count
            FROM contests c
            LEFT JOIN contest_participants cp ON c.id = cp.contest_id
            WHERE c.status = 'completed'
            GROUP BY c.id
            ORDER BY c.end_date DESC
            LIMIT ?
        `;
        return await db.all(sql, [limit]);
    }
}

module.exports = Contest;