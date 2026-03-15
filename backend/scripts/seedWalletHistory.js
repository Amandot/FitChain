/**
 * Seed run history for wallet 0x2873f105399f9f28e76a830fd8e224a9ca11c0d8
 * All runs are Mumbai-based routes.
 * Run: node backend/scripts/seedWalletHistory.js
 */
const db = require('../config/database');

const WALLET = '0x2873f105399f9f28e76a830fd8e224a9ca11c0d8';

// 12 realistic Mumbai runs over the past 3 months
const runs = [
  { date: '2026-01-04 06:15:00', distance_meters: 5200,  duration_seconds: 1680, notes: 'Marine Drive morning run' },
  { date: '2026-01-08 06:30:00', distance_meters: 3800,  duration_seconds: 1320, notes: 'Bandra Bandstand loop' },
  { date: '2026-01-13 07:00:00', distance_meters: 7100,  duration_seconds: 2400, notes: 'Worli Sea Face to Haji Ali' },
  { date: '2026-01-19 06:45:00', distance_meters: 4500,  duration_seconds: 1560, notes: 'Juhu Beach run' },
  { date: '2026-01-25 07:10:00', distance_meters: 6300,  duration_seconds: 2100, notes: 'Powai Lake circuit' },
  { date: '2026-02-02 06:20:00', distance_meters: 5800,  duration_seconds: 1920, notes: 'Marine Drive full stretch' },
  { date: '2026-02-09 06:50:00', distance_meters: 4200,  duration_seconds: 1440, notes: 'Sanjay Gandhi NP trail' },
  { date: '2026-02-15 07:00:00', distance_meters: 8500,  duration_seconds: 2880, notes: 'Bandra to Worli Sea Link walk' },
  { date: '2026-02-22 06:30:00', distance_meters: 3600,  duration_seconds: 1260, notes: 'Carter Road promenade' },
  { date: '2026-03-01 06:15:00', distance_meters: 6000,  duration_seconds: 2040, notes: 'Aarey Colony forest trail' },
  { date: '2026-03-08 07:20:00', distance_meters: 5500,  duration_seconds: 1860, notes: 'Versova Beach run' },
  { date: '2026-03-14 06:40:00', distance_meters: 9200,  duration_seconds: 3120, notes: 'Half marathon training — Bandra to Dadar' },
];

async function seed() {
  await db.initialize();

  // Upsert user
  await db.run(
    `INSERT OR IGNORE INTO users (wallet_address, username) VALUES (?, ?)`,
    [WALLET, 'MumbaiRunner']
  );

  let inserted = 0;
  let totalDistance = 0;

  for (const run of runs) {
    const avg_speed = run.distance_meters / run.duration_seconds; // m/s
    await db.run(
      `INSERT INTO run_history (wallet_address, date, distance_meters, duration_seconds, avg_speed, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [WALLET, run.date, run.distance_meters, run.duration_seconds, avg_speed, run.notes]
    );
    totalDistance += run.distance_meters;
    inserted++;
    console.log(`✅ ${run.date} — ${(run.distance_meters / 1000).toFixed(1)} km — ${run.notes}`);
  }

  // Update aggregate stats
  await db.run(
    `UPDATE users SET total_distance = total_distance + ?, updated_at = CURRENT_TIMESTAMP
     WHERE LOWER(wallet_address) = LOWER(?)`,
    [totalDistance, WALLET]
  );

  console.log(`\n🎉 Seeded ${inserted} runs (${(totalDistance / 1000).toFixed(1)} km total) for ${WALLET}`);
  await db.close();
}

seed().catch(e => { console.error(e); process.exit(1); });
