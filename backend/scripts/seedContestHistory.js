/**
 * Seed contest history for wallet 0x2873f105399f9f28e76a830fd8e224a9ca11c0d8
 * Joins contests 1 (completed) and 2 (completed) with realistic performance.
 * Run: node scripts/seedContestHistory.js  (from backend/)
 */
const db = require('../config/database');

const WALLET = '0x2873f105399f9f28e76a830fd8e224a9ca11c0d8';

async function seed() {
    await db.initialize();

    // Ensure user row exists
    await db.run(
        `INSERT OR IGNORE INTO users (wallet_address, username) VALUES (?, ?)`,
        [WALLET, 'MumbaiRunner']
    );

    // Contest 1 — New Year Fitness Challenge (target 100 km, completed)
    await db.run(
        `INSERT OR IGNORE INTO contest_participants
         (contest_id, user_wallet, current_distance, completed, rank_position, joined_at, last_update)
         VALUES (1, ?, 107500, 1, 2, '2024-01-01 08:00:00', '2024-01-31 20:00:00')`,
        [WALLET]
    );
    console.log('✅ Contest 1 — New Year Fitness Challenge: 107.5 km, Rank #2');

    // Contest 2 — Spring Marathon Prep (target 200 km, completed)
    await db.run(
        `INSERT OR IGNORE INTO contest_participants
         (contest_id, user_wallet, current_distance, completed, rank_position, joined_at, last_update)
         VALUES (2, ?, 198200, 0, 3, '2024-03-01 08:00:00', '2024-03-31 20:00:00')`,
        [WALLET]
    );
    console.log('✅ Contest 2 — Spring Marathon Prep: 198.2 km, Rank #3');

    // Prize for contest 1 rank 2
    await db.run(
        `INSERT OR IGNORE INTO prize_distributions
         (contest_id, winner_wallet, winner_username, rank_position, prize_amount, prize_type, status, notes)
         VALUES (1, ?, 'MumbaiRunner', 2, 100.0, 'XLM', 'completed', 'Second place — New Year Fitness Challenge')`,
        [WALLET]
    );
    console.log('✅ Prize: 100 XLM for Contest 1 rank #2');

    // Update user contest stats
    await db.run(
        `UPDATE users SET total_contests = total_contests + 2, total_earnings = total_earnings + 100.0,
         updated_at = CURRENT_TIMESTAMP WHERE LOWER(wallet_address) = LOWER(?)`,
        [WALLET]
    );

    console.log('\n🎉 Contest history seeded for', WALLET);
    await db.close();
}

seed().catch(e => { console.error(e); process.exit(1); });
