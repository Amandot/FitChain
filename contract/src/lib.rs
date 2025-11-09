#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone)]
pub struct ContestRecord {
    pub champion: Address,
    pub best_time_seconds: u64,
    pub end_timestamp: u64,
}

#[contract]
pub struct StriderContract;

#[contractimpl]
impl StriderContract {
    /// Submit a time for a loop. Creates new contest or challenges existing one.
    pub fn submit_time(
        env: Env,
        user: Address,
        loop_id: String,
        time_seconds: u64,
    ) -> bool {
        user.require_auth();

        let storage = env.storage().persistent();
        let contest_key = Symbol::new(&env, "contest");
        let fifteen_days: u64 = 15 * 24 * 60 * 60;
        let current_time = env.ledger().timestamp();

        // Try to get existing record
        let record_key = (contest_key, loop_id.clone());
        
        if let Some(mut record) = storage.get::<_, ContestRecord>(&record_key) {
            // Contest exists - check if time is better and within contest period
            if time_seconds < record.best_time_seconds && current_time < record.end_timestamp {
                // New champion!
                record.champion = user;
                record.best_time_seconds = time_seconds;
                record.end_timestamp = current_time + fifteen_days;
                storage.set(&record_key, &record);
                return true;
            }
            return false; // Time not better or contest expired
        } else {
            // New contest
            let new_record = ContestRecord {
                champion: user,
                best_time_seconds: time_seconds,
                end_timestamp: current_time + fifteen_days,
            };
            storage.set(&record_key, &new_record);
            return true;
        }
    }

    /// Get the current record for a loop
    pub fn get_record(env: Env, loop_id: String) -> Option<ContestRecord> {
        let storage = env.storage().persistent();
        let contest_key = Symbol::new(&env, "contest");
        let record_key = (contest_key, loop_id);
        storage.get(&record_key)
    }
}
