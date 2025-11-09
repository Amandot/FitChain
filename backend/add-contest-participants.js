const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/stellar_strider.db');

console.log('🏃‍♂️ Adding contest participants and updating distances...\n');

// Add more realistic contest participation data
const participantData = [
    // Contest 1 (New Year Fitness Challenge) - Completed
    { contest_id: 1, user_wallet: 'GAHK7EEG2WWHVKDNT4CEQFZGKF4LGDSW2IVM4S5DP42RBW3K6BTODB4A', current_distance: 110.8, completed: true },
    { contest_id: 1, user_wallet: 'GCKFBEIYTKP6RCZNVPH73XL7XFWTEOAO7GIHS4UECBZUP6DKQZYD4ZGS', current_distance: 105.5, completed: true },
    { contest_id: 1, user_wallet: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37', current_distance: 98.2, completed: false },
    { contest_id: 1, user_wallet: 'GCDSQBJUTWDCJHQSOB64AXEBYZSQ75WYC5NWPXNBWXYN2MAAAAFUBGABC', current_distance: 87.3, completed: false },

    // Contest 2 (Spring Marathon Prep) - Completed
    { contest_id: 2, user_wallet: 'GCKFBEIYTKP6RCZNVPH73XL7XFWTEOAO7GIHS4UECBZUP6DKQZYD4ZGS', current_distance: 205.7, completed: true },
    { contest_id: 2, user_wallet: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37', current_distance: 195.3, completed: false },
    { contest_id: 2, user_wallet: 'GAHK7EEG2WWHVKDNT4CEQFZGKF4LGDSW2IVM4S5DP42RBW3K6BTODB4A', current_distance: 189.1, completed: false },

    // Contest 3 (Summer Fitness Blast) - Active
    { contest_id: 3, user_wallet: 'GAHK7EEG2WWHVKDNT4CEQFZGKF4LGDSW2IVM4S5DP42RBW3K6BTODB4A', current_distance: 85.4, completed: false },
    { contest_id: 3, user_wallet: 'GCDSQBJUTWDCJHQSOB64AXEBYZSQ75WYC5NWPXNBWXYN2MAAAAFUBGABC', current_distance: 72.1, completed: false },
    { contest_id: 3, user_wallet: 'GBJCHUKUMVZ37REDDNPEUUJ4DAIZQOY6UUCS3NOIC5FKDN7VFQZJOTZI', current_distance: 68.9, completed: false }
];

let completed = 0;
const totalOperations = participantData.length;

// Clear existing participants first
db.run('DELETE FROM contest_participants', [], function (err) {
    if (err) {
        console.error('❌ Error clearing participants:', err.message);
        return;
    }

    console.log('🗑️ Cleared existing participants');

    // Add new participants
    participantData.forEach((participant, index) => {
        const sql = `
            INSERT INTO contest_participants (contest_id, user_wallet, current_distance, completed, last_update)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;

        db.run(sql, [participant.contest_id, participant.user_wallet, participant.current_distance, participant.completed], function (err) {
            if (err) {
                console.error(`❌ Error adding participant ${index + 1}:`, err.message);
            } else {
                console.log(`✅ Added participant to contest ${participant.contest_id}: ${participant.current_distance}km`);
            }

            completed++;
            if (completed === totalOperations) {
                console.log('\n🎉 Contest participants updated successfully!');
                console.log('\n📊 View contest leaderboards at:');
                console.log('- Frontend: http://localhost:5173 → Champions');
                console.log('- API: http://localhost:3001/api/contests/1/winners');
                db.close();
            }
        });
    });
});