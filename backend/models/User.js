const db = require('../config/database');

class User {
    static async create(userData) {
        const {
            wallet_address,
            username,
            email,
            age_category,
            profile_picture
        } = userData;

        const sql = `
            INSERT INTO users (wallet_address, username, email, age_category, profile_picture)
            VALUES (?, ?, ?, ?, ?)
        `;

        try {
            const result = await db.run(sql, [
                wallet_address,
                username,
                email,
                age_category,
                profile_picture
            ]);
            return await this.findByWallet(wallet_address);
        } catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    static async findByWallet(wallet_address) {
        const sql = 'SELECT * FROM users WHERE wallet_address = ?';
        return await db.get(sql, [wallet_address]);
    }

    static async findByUsername(username) {
        const sql = 'SELECT * FROM users WHERE username = ?';
        return await db.get(sql, [username]);
    }

    static async update(wallet_address, updateData) {
        const fields = [];
        const values = [];

        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        });

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        values.push(wallet_address);
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE wallet_address = ?`;

        await db.run(sql, values);
        return await this.findByWallet(wallet_address);
    }

    static async updateStats(wallet_address, stats) {
        const {
            total_distance,
            total_contests,
            contests_won,
            total_earnings
        } = stats;

        const sql = `
            UPDATE users 
            SET total_distance = ?, total_contests = ?, contests_won = ?, total_earnings = ?
            WHERE wallet_address = ?
        `;

        return await db.run(sql, [
            total_distance,
            total_contests,
            contests_won,
            total_earnings,
            wallet_address
        ]);
    }

    static async getGlobalLeaderboard(limit = 50) {
        const sql = `
            SELECT 
                u.wallet_address,
                u.username,
                u.total_distance,
                u.total_contests,
                u.contests_won,
                u.total_earnings,
                COUNT(n.id) as nft_count,
                ROW_NUMBER() OVER (ORDER BY u.total_distance DESC, u.contests_won DESC) as rank_position
            FROM users u
            LEFT JOIN nft_rewards n ON u.wallet_address = n.user_wallet
            WHERE u.total_distance > 0
            GROUP BY u.wallet_address
            ORDER BY u.total_distance DESC, u.contests_won DESC
            LIMIT ?
        `;

        return await db.all(sql, [limit]);
    }

    static async getUserRank(wallet_address) {
        const sql = `
            SELECT rank_position FROM (
                SELECT 
                    wallet_address,
                    ROW_NUMBER() OVER (ORDER BY total_distance DESC, contests_won DESC) as rank_position
                FROM users
                WHERE total_distance > 0
            ) ranked
            WHERE wallet_address = ?
        `;

        const result = await db.get(sql, [wallet_address]);
        return result ? result.rank_position : null;
    }

    static async getTopPerformers(age_category = null, limit = 10) {
        let sql = `
            SELECT 
                u.wallet_address,
                u.username,
                u.age_category,
                u.total_distance,
                u.contests_won,
                u.total_earnings,
                COUNT(n.id) as nft_count
            FROM users u
            LEFT JOIN nft_rewards n ON u.wallet_address = n.user_wallet
            WHERE u.total_distance > 0
        `;

        const params = [];
        if (age_category) {
            sql += ' AND u.age_category = ?';
            params.push(age_category);
        }

        sql += `
            GROUP BY u.wallet_address
            ORDER BY u.total_distance DESC, u.contests_won DESC
            LIMIT ?
        `;
        params.push(limit);

        return await db.all(sql, params);
    }
}

module.exports = User;