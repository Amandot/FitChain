const db = require('../config/database');
const User = require('../models/User');
const Contest = require('../models/Contest');
const PrizeDistribution = require('../models/PrizeDistribution');
const PaymentHistory = require('../models/PaymentHistory');

async function initializeDatabase() {
    try {
        console.log('🚀 Initializing Stellar Strider database...');

        // Initialize database connection and schema
        await db.initialize();

        console.log('📊 Adding sample data...');

        // Sample users
        const sampleUsers = [
            {
                wallet_address: 'GCKFBEIYTKP6RCZNVPH73XL7XFWTEOAO7GIHS4UECBZUP6DKQZYD4ZGS',
                username: 'FitnessKing',
                email: 'king@example.com',
                age_category: '26-35',
                total_distance: 1250.5,
                total_contests: 15,
                contests_won: 3,
                total_earnings: 450.75
            },
            {
                wallet_address: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
                username: 'RunnerQueen',
                email: 'queen@example.com',
                age_category: '18-25',
                total_distance: 980.3,
                total_contests: 12,
                contests_won: 2,
                total_earnings: 320.50
            },
            {
                wallet_address: 'GAHK7EEG2WWHVKDNT4CEQFZGKF4LGDSW2IVM4S5DP42RBW3K6BTODB4A',
                username: 'MarathonMaster',
                email: 'master@example.com',
                age_category: '36-45',
                total_distance: 2100.8,
                total_contests: 20,
                contests_won: 5,
                total_earnings: 875.25
            },
            {
                wallet_address: 'GCDSQBJUTWDCJHQSOB64AXEBYZSQ75WYC5NWPXNBWXYN2MAAAAFUBGABC',
                username: 'SpeedWalker',
                email: 'walker@example.com',
                age_category: '46-55',
                total_distance: 750.2,
                total_contests: 8,
                contests_won: 1,
                total_earnings: 125.00
            },
            {
                wallet_address: 'GBJCHUKUMVZ37REDDNPEUUJ4DAIZQOY6UUCS3NOIC5FKDN7VFQZJOTZI',
                username: 'HealthyHiker',
                email: 'hiker@example.com',
                age_category: '55+',
                total_distance: 650.7,
                total_contests: 6,
                contests_won: 1,
                total_earnings: 100.00
            }
        ];

        for (const userData of sampleUsers) {
            try {
                await User.create(userData);
                console.log(`✅ Created user: ${userData.username}`);
            } catch (error) {
                if (error.message.includes('UNIQUE constraint failed')) {
                    console.log(`⚠️  User ${userData.username} already exists, skipping...`);
                } else {
                    console.error(`❌ Error creating user ${userData.username}:`, error.message);
                }
            }
        }

        // Sample contests
        const sampleContests = [
            {
                title: 'New Year Fitness Challenge',
                description: 'Start the year strong with our 30-day fitness challenge!',
                age_category: '26-35',
                start_date: '2024-01-01 00:00:00',
                end_date: '2024-01-31 23:59:59',
                duration_days: 30,
                target_distance: 100.0,
                entry_fee: 10.0,
                prize_pool: 500.0,
                max_participants: 50,
                status: 'completed',
                created_by: sampleUsers[0].wallet_address
            },
            {
                title: 'Spring Marathon Prep',
                description: 'Prepare for marathon season with this intensive training contest.',
                age_category: '18-25',
                start_date: '2024-03-01 00:00:00',
                end_date: '2024-03-31 23:59:59',
                duration_days: 31,
                target_distance: 200.0,
                entry_fee: 15.0,
                prize_pool: 750.0,
                max_participants: 30,
                status: 'completed',
                created_by: sampleUsers[1].wallet_address
            },
            {
                title: 'Summer Fitness Blast',
                description: 'Beat the heat with our summer fitness challenge!',
                age_category: '36-45',
                start_date: '2024-06-01 00:00:00',
                end_date: '2024-06-30 23:59:59',
                duration_days: 30,
                target_distance: 150.0,
                entry_fee: 12.0,
                prize_pool: 600.0,
                max_participants: 40,
                status: 'active',
                created_by: sampleUsers[2].wallet_address
            },
            {
                title: 'Holiday Health Challenge',
                description: 'Stay healthy during the holiday season!',
                age_category: '46-55',
                start_date: '2024-12-01 00:00:00',
                end_date: '2024-12-31 23:59:59',
                duration_days: 31,
                target_distance: 120.0,
                entry_fee: 8.0,
                prize_pool: 400.0,
                max_participants: 25,
                status: 'upcoming',
                created_by: sampleUsers[3].wallet_address
            }
        ];

        const contestIds = [];
        for (const contestData of sampleContests) {
            try {
                const contest = await Contest.create(contestData);
                contestIds.push(contest.id);
                console.log(`✅ Created contest: ${contestData.title}`);
            } catch (error) {
                console.error(`❌ Error creating contest ${contestData.title}:`, error.message);
            }
        }

        // Sample contest participants
        if (contestIds.length > 0) {
            const participations = [
                { contest_id: contestIds[0], user_wallet: sampleUsers[0].wallet_address, current_distance: 105.5, completed: true },
                { contest_id: contestIds[0], user_wallet: sampleUsers[1].wallet_address, current_distance: 98.2, completed: false },
                { contest_id: contestIds[0], user_wallet: sampleUsers[2].wallet_address, current_distance: 110.8, completed: true },

                { contest_id: contestIds[1], user_wallet: sampleUsers[1].wallet_address, current_distance: 195.3, completed: false },
                { contest_id: contestIds[1], user_wallet: sampleUsers[0].wallet_address, current_distance: 205.7, completed: true },

                { contest_id: contestIds[2], user_wallet: sampleUsers[2].wallet_address, current_distance: 85.4, completed: false },
                { contest_id: contestIds[2], user_wallet: sampleUsers[3].wallet_address, current_distance: 72.1, completed: false }
            ];

            for (const participation of participations) {
                try {
                    await Contest.joinContest(participation.contest_id, participation.user_wallet);
                    await Contest.updateParticipantDistance(
                        participation.contest_id,
                        participation.user_wallet,
                        participation.current_distance
                    );
                    console.log(`✅ Added participation for contest ${participation.contest_id}`);
                } catch (error) {
                    console.error(`❌ Error adding participation:`, error.message);
                }
            }
        }

        // Sample prize distributions
        const samplePrizes = [
            {
                contest_id: contestIds[0],
                winner_wallet: sampleUsers[2].wallet_address,
                winner_username: sampleUsers[2].username,
                rank_position: 1,
                prize_amount: 250.0,
                prize_type: 'XLM',
                transaction_hash: 'abc123def456ghi789',
                status: 'completed',
                notes: 'First place winner - New Year Challenge'
            },
            {
                contest_id: contestIds[0],
                winner_wallet: sampleUsers[0].wallet_address,
                winner_username: sampleUsers[0].username,
                rank_position: 2,
                prize_amount: 150.0,
                prize_type: 'XLM',
                transaction_hash: 'def456ghi789jkl012',
                status: 'completed',
                notes: 'Second place winner - New Year Challenge'
            },
            {
                contest_id: contestIds[1],
                winner_wallet: sampleUsers[0].wallet_address,
                winner_username: sampleUsers[0].username,
                rank_position: 1,
                prize_amount: 375.0,
                prize_type: 'XLM',
                transaction_hash: 'ghi789jkl012mno345',
                status: 'completed',
                notes: 'First place winner - Spring Marathon Prep'
            }
        ];

        for (const prizeData of samplePrizes) {
            try {
                await PrizeDistribution.create(prizeData);
                console.log(`✅ Created prize distribution for ${prizeData.winner_username}`);
            } catch (error) {
                console.error(`❌ Error creating prize distribution:`, error.message);
            }
        }

        // Sample payment history
        const samplePayments = [
            {
                from_wallet: sampleUsers[0].wallet_address,
                to_wallet: 'PLATFORM_WALLET_ADDRESS',
                amount: 10.0,
                currency: 'XLM',
                transaction_type: 'entry_fee',
                contest_id: contestIds[0],
                transaction_hash: 'payment_hash_001',
                status: 'completed'
            },
            {
                from_wallet: 'PLATFORM_WALLET_ADDRESS',
                to_wallet: sampleUsers[2].wallet_address,
                amount: 250.0,
                currency: 'XLM',
                transaction_type: 'prize_payout',
                contest_id: contestIds[0],
                transaction_hash: 'payout_hash_001',
                status: 'completed'
            },
            {
                from_wallet: 'PLATFORM_WALLET_ADDRESS',
                to_wallet: sampleUsers[0].wallet_address,
                amount: 150.0,
                currency: 'XLM',
                transaction_type: 'prize_payout',
                contest_id: contestIds[0],
                transaction_hash: 'payout_hash_002',
                status: 'completed'
            }
        ];

        for (const paymentData of samplePayments) {
            try {
                await PaymentHistory.create(paymentData);
                console.log(`✅ Created payment record: ${paymentData.transaction_type}`);
            } catch (error) {
                console.error(`❌ Error creating payment record:`, error.message);
            }
        }

        console.log('🎉 Database initialization completed successfully!');
        console.log('📊 Sample data added:');
        console.log(`   - ${sampleUsers.length} users`);
        console.log(`   - ${sampleContests.length} contests`);
        console.log(`   - ${samplePrizes.length} prize distributions`);
        console.log(`   - ${samplePayments.length} payment records`);

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    } finally {
        await db.close();
    }
}

// Run initialization if called directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('✅ Initialization script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Initialization script failed:', error);
            process.exit(1);
        });
}

module.exports = initializeDatabase;