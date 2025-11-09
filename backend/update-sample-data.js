const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/stellar_strider.db');

console.log('🔄 Updating sample data with realistic statistics...\n');

// Update users with realistic fitness data
const userUpdates = [
    {
        wallet: 'GCKFBEIYTKP6RCZNVPH73XL7XFWTEOAO7GIHS4UECBZUP6DKQZYD4ZGS',
        username: 'FitnessKing',
        total_distance: 1250.5,
        total_contests: 15,
        contests_won: 3,
        total_earnings: 450.75
    },
    {
        wallet: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
        username: 'RunnerQueen',
        total_distance: 980.3,
        total_contests: 12,
        contests_won: 2,
        total_earnings: 320.50
    },
    {
        wallet: 'GAHK7EEG2WWHVKDNT4CEQFZGKF4LGDSW2IVM4S5DP42RBW3K6BTODB4A',
        username: 'MarathonMaster',
        total_distance: 2100.8,
        total_contests: 20,
        contests_won: 5,
        total_earnings: 875.25
    },
    {
        wallet: 'GCDSQBJUTWDCJHQSOB64AXEBYZSQ75WYC5NWPXNBWXYN2MAAAAFUBGABC',
        username: 'SpeedWalker',
        total_distance: 750.2,
        total_contests: 8,
        contests_won: 1,
        total_earnings: 125.00
    },
    {
        wallet: 'GBJCHUKUMVZ37REDDNPEUUJ4DAIZQOY6UUCS3NOIC5FKDN7VFQZJOTZI',
        username: 'HealthyHiker',
        total_distance: 650.7,
        total_contests: 6,
        contests_won: 1,
        total_earnings: 100.00
    }
];

// Update contest statuses
const contestUpdates = [
    { id: 1, status: 'completed' },
    { id: 2, status: 'completed' },
    { id: 3, status: 'active' },
    { id: 4, status: 'upcoming' }
];

// Update prize distribution statuses
const prizeUpdates = [
    { id: 1, status: 'completed' },
    { id: 2, status: 'completed' },
    { id: 3, status: 'completed' }
];

let completed = 0;
const totalOperations = userUpdates.length + contestUpdates.length + prizeUpdates.length;

// Update users
userUpdates.forEach(user => {
    const sql = `
        UPDATE users 
        SET total_distance = ?, total_contests = ?, contests_won = ?, total_earnings = ?
        WHERE wallet_address = ?
    `;

    db.run(sql, [user.total_distance, user.total_contests, user.contests_won, user.total_earnings, user.wallet], function (err) {
        if (err) {
            console.error(`❌ Error updating ${user.username}:`, err.message);
        } else {
            console.log(`✅ Updated ${user.username}: ${user.total_distance}km, ${user.contests_won} wins, ${user.total_earnings} XLM`);
        }

        completed++;
        if (completed === totalOperations) {
            console.log('\n🎉 Sample data updated successfully!');
            console.log('\n📊 View your data at:');
            console.log('- Web Viewer: Open database-viewer.html in browser');
            console.log('- API: http://localhost:3001/api/leaderboard/global');
            console.log('- Frontend: http://localhost:5173 → Leaderboard');
            db.close();
        }
    });
});

// Update contests
contestUpdates.forEach(contest => {
    const sql = 'UPDATE contests SET status = ? WHERE id = ?';

    db.run(sql, [contest.status, contest.id], function (err) {
        if (err) {
            console.error(`❌ Error updating contest ${contest.id}:`, err.message);
        } else {
            console.log(`✅ Updated contest ${contest.id} status to: ${contest.status}`);
        }

        completed++;
        if (completed === totalOperations) {
            console.log('\n🎉 Sample data updated successfully!');
            console.log('\n📊 View your data at:');
            console.log('- Web Viewer: Open database-viewer.html in browser');
            console.log('- API: http://localhost:3001/api/leaderboard/global');
            console.log('- Frontend: http://localhost:5173 → Leaderboard');
            db.close();
        }
    });
});

// Update prize distributions
prizeUpdates.forEach(prize => {
    const sql = 'UPDATE prize_distributions SET status = ? WHERE id = ?';

    db.run(sql, [prize.status, prize.id], function (err) {
        if (err) {
            console.error(`❌ Error updating prize ${prize.id}:`, err.message);
        } else {
            console.log(`✅ Updated prize distribution ${prize.id} status to: ${prize.status}`);
        }

        completed++;
        if (completed === totalOperations) {
            console.log('\n🎉 Sample data updated successfully!');
            console.log('\n📊 View your data at:');
            console.log('- Web Viewer: Open database-viewer.html in browser');
            console.log('- API: http://localhost:3001/api/leaderboard/global');
            console.log('- Frontend: http://localhost:5173 → Leaderboard');
            db.close();
        }
    });
});