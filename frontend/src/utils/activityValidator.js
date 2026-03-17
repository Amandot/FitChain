/**
 * Activity Validation System
 * Detects non-walking activity (cycling, driving) based on speed patterns.
 *
 * Walking speed reference:
 *   Slow walk  : ~2–4 km/h  (0.55–1.1 m/s)
 *   Normal walk: ~4–6 km/h  (1.1–1.67 m/s)
 *   Fast walk  : ~6–8 km/h  (1.67–2.22 m/s)
 *   Race walk  : up to ~9 km/h (2.5 m/s)
 *   Hard cap   : 10 km/h    (2.78 m/s) — above this is non-walking
 */

// ── Constants ────────────────────────────────────────────────────────────────

/** Maximum speed considered human walking (km/h) */
export const MAX_WALKING_SPEED_KMH = 10;

/** m/s equivalent of the walking cap */
export const MAX_WALKING_SPEED_MS = MAX_WALKING_SPEED_KMH / 3.6; // ≈ 2.78 m/s

/**
 * How many consecutive over-threshold readings before flagging the session.
 * At ~1 reading/sec this means ~5 seconds of sustained high speed.
 */
const CONSECUTIVE_VIOLATIONS_THRESHOLD = 5;

/**
 * Minimum fraction of total readings that must be over-threshold before
 * the whole session is considered non-walking (catches sustained cheating).
 */
const SESSION_VIOLATION_RATIO = 0.4; // 40 %

/**
 * Sudden-jump detector: if speed jumps by more than this in one reading
 * it is likely a GPS glitch or a vehicle, not a human.
 */
const MAX_SPEED_JUMP_MS = 5; // 18 km/h jump in one tick

// ── Types (JSDoc) ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ValidationState
 * @property {number}   consecutiveViolations  - Readings in a row above threshold
 * @property {number}   totalReadings          - All readings processed
 * @property {number}   violationReadings      - Readings above threshold (total)
 * @property {number}   lastSpeed              - Previous speed sample (m/s)
 * @property {boolean}  isFlagged              - Session currently flagged
 * @property {string}   flagReason             - Human-readable reason for flag
 * @property {number[]} speedHistory           - Rolling window of recent speeds
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid        - True if this reading is acceptable
 * @property {boolean} sessionFlagged - True if the whole session should be stopped
 * @property {string}  reason         - Why the reading/session was rejected
 * @property {string}  activityType   - 'walking' | 'cycling' | 'driving' | 'unknown'
 * @property {number}  speedKmh       - Speed in km/h for display
 */

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Create a fresh validation state object.
 * Call this once when a new tracking session starts.
 * @returns {ValidationState}
 */
export function createValidationState() {
  return {
    consecutiveViolations: 0,
    totalReadings: 0,
    violationReadings: 0,
    lastSpeed: 0,
    isFlagged: false,
    flagReason: '',
    speedHistory: [],
  };
}

// ── Core validator ────────────────────────────────────────────────────────────

/**
 * Validate a single GPS speed reading and update the running state.
 *
 * @param {ValidationState} state   - Mutable state object (updated in place)
 * @param {number}          speedMs - Current speed in m/s (from GPS or calculated)
 * @param {number}          [accuracyM=20] - GPS accuracy in metres
 * @returns {ValidationResult}
 */
export function validateSpeedReading(state, speedMs, accuracyM = 20) {
  // Ignore readings with very poor GPS accuracy — they produce false spikes
  if (accuracyM > 80) {
    return {
      isValid: true,
      sessionFlagged: state.isFlagged,
      reason: 'GPS accuracy too low to validate',
      activityType: 'unknown',
      speedKmh: speedMs * 3.6,
    };
  }

  state.totalReadings += 1;
  const speedKmh = speedMs * 3.6;

  // Keep a rolling window of the last 10 speeds for pattern analysis
  state.speedHistory.push(speedMs);
  if (state.speedHistory.length > 10) state.speedHistory.shift();

  // ── 1. Sudden speed-jump check (GPS glitch / vehicle) ──────────────────────
  const speedJump = speedMs - state.lastSpeed;
  state.lastSpeed = speedMs;

  if (speedJump > MAX_SPEED_JUMP_MS && speedMs > MAX_WALKING_SPEED_MS) {
    state.violationReadings += 1;
    state.consecutiveViolations += 1;
    return buildResult(state, false, 'Sudden speed spike detected — possible vehicle or GPS error', speedKmh);
  }

  // ── 2. Over-threshold check ────────────────────────────────────────────────
  if (speedMs > MAX_WALKING_SPEED_MS) {
    state.violationReadings += 1;
    state.consecutiveViolations += 1;

    // Flag session after sustained violations
    if (state.consecutiveViolations >= CONSECUTIVE_VIOLATIONS_THRESHOLD) {
      state.isFlagged = true;
      state.flagReason = `Speed exceeded ${MAX_WALKING_SPEED_KMH} km/h for ${state.consecutiveViolations} consecutive readings`;
    }

    const activityType = classifyActivity(speedKmh);
    return buildResult(
      state,
      false,
      `Speed ${speedKmh.toFixed(1)} km/h exceeds walking limit of ${MAX_WALKING_SPEED_KMH} km/h`,
      speedKmh,
      activityType,
    );
  }

  // ── 3. Unusual pattern check (erratic speed, not human gait) ──────────────
  if (state.speedHistory.length >= 5) {
    const patternIssue = detectUnusualPattern(state.speedHistory);
    if (patternIssue) {
      state.violationReadings += 1;
      state.consecutiveViolations += 1;
      return buildResult(state, false, patternIssue, speedKmh);
    }
  }

  // ── 4. Valid reading — reset consecutive counter ───────────────────────────
  state.consecutiveViolations = 0;

  // Check session-level ratio even if current reading is fine
  const violationRatio = state.totalReadings > 10
    ? state.violationReadings / state.totalReadings
    : 0;

  if (violationRatio >= SESSION_VIOLATION_RATIO && !state.isFlagged) {
    state.isFlagged = true;
    state.flagReason = `${(violationRatio * 100).toFixed(0)}% of readings exceeded walking speed`;
  }

  return buildResult(state, true, '', speedKmh, 'walking');
}

// ── Session-level check ───────────────────────────────────────────────────────

/**
 * Check whether the overall session should be rejected.
 * Call this when the user stops tracking.
 *
 * @param {ValidationState} state
 * @returns {{ valid: boolean, reason: string }}
 */
export function validateSession(state) {
  if (state.isFlagged) {
    return { valid: false, reason: state.flagReason };
  }

  if (state.totalReadings > 10) {
    const ratio = state.violationReadings / state.totalReadings;
    if (ratio >= SESSION_VIOLATION_RATIO) {
      return {
        valid: false,
        reason: `Activity rejected: ${(ratio * 100).toFixed(0)}% of readings exceeded walking speed`,
      };
    }
  }

  return { valid: true, reason: '' };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Classify the likely activity type from speed.
 * @param {number} speedKmh
 * @returns {'walking'|'cycling'|'driving'|'unknown'}
 */
export function classifyActivity(speedKmh) {
  if (speedKmh <= MAX_WALKING_SPEED_KMH) return 'walking';
  if (speedKmh <= 30) return 'cycling';
  if (speedKmh <= 130) return 'driving';
  return 'unknown';
}

/**
 * Detect speed patterns that don't match human walking.
 * Returns a description string if suspicious, null if fine.
 *
 * @param {number[]} recentSpeeds - Array of recent speed samples in m/s
 * @returns {string|null}
 */
function detectUnusualPattern(recentSpeeds) {
  // Pattern 1: Sustained high-but-sub-threshold speed (e.g. slow cycling ~9 km/h)
  const highWalkThreshold = 2.2; // ~8 km/h — top of comfortable walking
  const sustainedHighCount = recentSpeeds.filter(s => s > highWalkThreshold).length;
  if (sustainedHighCount >= 4 && recentSpeeds.length >= 5) {
    return `Sustained speed near walking limit — possible cycling (avg ${(avg(recentSpeeds) * 3.6).toFixed(1)} km/h)`;
  }

  // Pattern 2: Extremely low variance at high speed (machine-like consistency)
  const mean = avg(recentSpeeds);
  if (mean > 1.5) { // only check if moving at a decent pace
    const variance = recentSpeeds.reduce((sum, s) => sum + (s - mean) ** 2, 0) / recentSpeeds.length;
    if (variance < 0.01 && mean > 1.8) {
      return 'Unnaturally constant speed — possible motorised transport';
    }
  }

  return null;
}

/** Simple average helper */
function avg(arr) {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

/** Build a ValidationResult, also propagating session flag. */
function buildResult(state, isValid, reason, speedKmh, activityType = 'unknown') {
  return {
    isValid,
    sessionFlagged: state.isFlagged,
    reason,
    activityType: activityType || classifyActivity(speedKmh),
    speedKmh,
  };
}
