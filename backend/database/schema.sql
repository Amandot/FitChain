-- Stellar Strider Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    email TEXT,
    age_category TEXT CHECK(age_category IN ('18-25', '26-35', '36-45', '46-55', '55+')),
    profile_picture TEXT,
    total_distance REAL DEFAULT 0,
    total_contests INTEGER DEFAULT 0,
    contests_won INTEGER DEFAULT 0,
    total_earnings REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contests table
CREATE TABLE IF NOT EXISTS contests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    age_category TEXT CHECK(age_category IN ('18-25', '26-35', '36-45', '46-55', '55+')),
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    duration_days INTEGER NOT NULL,
    target_distance REAL NOT NULL,
    entry_fee REAL DEFAULT 0,
    prize_pool REAL DEFAULT 0,
    max_participants INTEGER,
    status TEXT CHECK(status IN ('upcoming', 'active', 'completed', 'cancelled')) DEFAULT 'upcoming',
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contest participants table
CREATE TABLE IF NOT EXISTS contest_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contest_id INTEGER NOT NULL,
    user_wallet TEXT NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    current_distance REAL DEFAULT 0,
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE,
    rank_position INTEGER,
    FOREIGN KEY (contest_id) REFERENCES contests(id),
    FOREIGN KEY (user_wallet) REFERENCES users(wallet_address),
    UNIQUE(contest_id, user_wallet)
);

-- Prize distributions table
CREATE TABLE IF NOT EXISTS prize_distributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contest_id INTEGER NOT NULL,
    winner_wallet TEXT NOT NULL,
    winner_username TEXT,
    rank_position INTEGER NOT NULL,
    prize_amount REAL NOT NULL,
    prize_type TEXT DEFAULT 'XLM',
    transaction_hash TEXT,
    distribution_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (contest_id) REFERENCES contests(id),
    FOREIGN KEY (winner_wallet) REFERENCES users(wallet_address)
);

-- Payment history table
CREATE TABLE IF NOT EXISTS payment_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_wallet TEXT,
    to_wallet TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'XLM',
    transaction_type TEXT CHECK(transaction_type IN ('entry_fee', 'prize_payout', 'refund', 'bonus')),
    contest_id INTEGER,
    transaction_hash TEXT,
    stellar_operation_id TEXT,
    status TEXT CHECK(status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    failure_reason TEXT,
    FOREIGN KEY (contest_id) REFERENCES contests(id)
);

-- NFT rewards table
CREATE TABLE IF NOT EXISTS nft_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_wallet TEXT NOT NULL,
    contest_id INTEGER,
    nft_name TEXT NOT NULL,
    nft_description TEXT,
    nft_image TEXT,
    rarity TEXT CHECK(rarity IN ('common', 'rare', 'epic', 'legendary')),
    token_id TEXT,
    mint_transaction_hash TEXT,
    earned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_wallet) REFERENCES users(wallet_address),
    FOREIGN KEY (contest_id) REFERENCES contests(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contest_participants_contest ON contest_participants(contest_id);
CREATE INDEX IF NOT EXISTS idx_prize_distributions_contest ON prize_distributions(contest_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_to_wallet ON payment_history(to_wallet);