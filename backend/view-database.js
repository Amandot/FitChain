const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = './database/stellar_strider.db';

console.log('🗄️ Stellar Strider Database Viewer');
console.log('=====================================\n');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        return;
    }
    console.log('✅ Connected to SQLite database\n');

    // Show all tables
    showTables();
});

function showTables() {
    console.log('📋 DATABASE TABLES:');
    console.log('==================');

    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
        if (err) {
            console.error('Error:', err.message);
            return;
        }

        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name}`);
        });

        console.log('\n');
        showUsers();
    });
}

function showUsers() {
    console.log('👥 USERS TABLE:');
    console.log('===============');

    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            console.error('Error:', err.message);
            return;
        }

        if (rows.length === 0) {
            console.log('No users found.');
        } else {
            console.table(rows);
        }

        console.log('\n');
        showContests();
    });
}

function showContests() {
    console.log('🏆 CONTESTS TABLE:');
    console.log('==================');

    db.all("SELECT id, title, status, prize_pool, start_date, end_date FROM contests", [], (err, rows) => {
        if (err) {
            console.error('Error:', err.message);
            return;
        }

        if (rows.length === 0) {
            console.log('No contests found.');
        } else {
            console.table(rows);
        }

        console.log('\n');
        showPrizeDistributions();
    });
}

function showPrizeDistributions() {
    console.log('💰 PRIZE DISTRIBUTIONS TABLE:');
    console.log('=============================');

    db.all(`
        SELECT 
            pd.id,
            pd.winner_username,
            pd.rank_position,
            pd.prize_amount,
            pd.prize_type,
            pd.status,
            pd.distribution_date,
            c.title as contest_title
        FROM prize_distributions pd
        LEFT JOIN contests c ON pd.contest_id = c.id
        ORDER BY pd.distribution_date DESC
    `, [], (err, rows) => {
        if (err) {
            console.error('Error:', err.message);
            return;
        }

        if (rows.length === 0) {
            console.log('No prize distributions found.');
        } else {
            console.table(rows);
        }

        console.log('\n');
        showLeaderboard();
    });
}

function showLeaderboard() {
    console.log('📊 LEADERBOARD (Top 10):');
    console.log('========================');

    db.all(`
        SELECT 
            username,
            total_distance,
            total_contests,
            contests_won,
            total_earnings,
            age_category
        FROM users 
        WHERE total_distance > 0
        ORDER BY total_distance DESC, contests_won DESC
        LIMIT 10
    `, [], (err, rows) => {
        if (err) {
            console.error('Error:', err.message);
            return;
        }

        if (rows.length === 0) {
            console.log('No leaderboard data found.');
        } else {
            console.table(rows);
        }

        console.log('\n');
        showSummary();
    });
}

function showSummary() {
    console.log('📈 DATABASE SUMMARY:');
    console.log('===================');

    // Count records in each table
    const queries = [
        { name: 'Users', query: 'SELECT COUNT(*) as count FROM users' },
        { name: 'Contests', query: 'SELECT COUNT(*) as count FROM contests' },
        { name: 'Prize Distributions', query: 'SELECT COUNT(*) as count FROM prize_distributions' },
        { name: 'Contest Participants', query: 'SELECT COUNT(*) as count FROM contest_participants' }
    ];

    let completed = 0;
    const summary = {};

    queries.forEach(({ name, query }) => {
        db.get(query, [], (err, row) => {
            if (err) {
                console.error(`Error counting ${name}:`, err.message);
            } else {
                summary[name] = row.count;
            }

            completed++;
            if (completed === queries.length) {
                console.table(summary);

                console.log('\n🎯 HOW TO VIEW DATA:');
                console.log('===================');
                console.log('1. 🌐 Web Browser: Open database-viewer.html');
                console.log('2. 🔗 API Endpoints: http://localhost:3001/api');
                console.log('3. 📱 Frontend App: http://localhost:5173 → Leaderboard');
                console.log('4. 🖥️  This Script: node view-database.js');
                console.log('5. 🛠️  DB Browser: Download DB Browser for SQLite');

                db.close();
            }
        });
    });
}