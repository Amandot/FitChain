import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../App';
import './ProfilePage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const fmt = {
  distance: (m) => m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`,
  duration: (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m ${sec}s`;
  },
  date: (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  pace: (m, s) => s > 0 && m > 0 ? `${((s / 60) / (m / 1000)).toFixed(1)} min/km` : '—',
  addr: (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '',
};

export default function ProfilePage() {
  const wallet = useWallet();
  const walletAddress = wallet?.metaMaskInfo?.address || wallet?.walletAddress;

  const [profile, setProfile] = useState(null);
  const [runs, setRuns] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('runs');
  const [pollingRef, setPollingRef] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const fetchAll = useCallback(async (addr) => {
    if (!addr) return;
    setLoading(true);
    setError(null);
    try {
      const [pRes, rRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/api/profile/${addr}`),
        fetch(`${API_BASE}/api/profile/${addr}/runs`),
        fetch(`${API_BASE}/api/profile/${addr}/contests`),
      ]);
      const [p, r, c] = await Promise.all([pRes.json(), rRes.json(), cRes.json()]);
      if (p.success) setProfile(p.data);
      if (r.success) setRuns(r.data);
      if (c.success) setContests(c.data);
    } catch (e) {
      setError('Could not load profile data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRun = async (runId) => {
    setDeletingId(runId);
    try {
      const res = await fetch(`${API_BASE}/api/profile/${walletAddress}/runs/${runId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRuns(prev => prev.filter(r => r.id !== runId));
        setProfile(prev => prev ? { ...prev, total_distance: Math.max(0, (prev.total_distance || 0) - (runs.find(r => r.id === runId)?.distance_meters || 0)) } : prev);
      }
    } catch (e) { /* silent */ }
    setDeletingId(null);
    setConfirmId(null);
  };

  // Initial fetch + real-time polling every 30s
  useEffect(() => {
    if (!walletAddress) return;
    fetchAll(walletAddress);
    const id = setInterval(() => fetchAll(walletAddress), 30000);
    setPollingRef(id);
    return () => clearInterval(id);
  }, [walletAddress, fetchAll]);

  if (!walletAddress) {
    return (
      <div className="profile-empty-state">
        <div className="profile-empty-icon">🦊</div>
        <h2>Connect Your Wallet</h2>
        <p>Connect MetaMask to view your profile, run history, and contest results.</p>
      </div>
    );
  }

  const totalRunDistance = runs.reduce((s, r) => s + r.distance_meters, 0);
  const totalRunTime = runs.reduce((s, r) => s + r.duration_seconds, 0);

  return (
    <div className="profile-page">
      {/* Header card */}
      <motion.div
        className="profile-hero glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="profile-avatar">
          {walletAddress.slice(2, 4).toUpperCase()}
        </div>
        <div className="profile-hero-info">
          <h2 className="profile-wallet">{fmt.addr(walletAddress)}</h2>
          <p className="profile-wallet-full">{walletAddress}</p>
          <div className="profile-badges">
            <span className="badge badge-metamask">🦊 MetaMask</span>
            {profile?.age_category && <span className="badge badge-age">{profile.age_category}</span>}
          </div>
        </div>
        <button className="profile-refresh-btn" onClick={() => fetchAll(walletAddress)} title="Refresh">
          🔄
        </button>
      </motion.div>

      {/* Stats row */}
      <motion.div
        className="profile-stats-row"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {[
          { icon: '🏃', label: 'Total Runs', value: runs.length },
          { icon: '📏', label: 'Total Distance', value: fmt.distance(totalRunDistance) },
          { icon: '⏱️', label: 'Total Time', value: fmt.duration(totalRunTime) },
          { icon: '🏆', label: 'Contests', value: profile?.total_contests ?? contests.length },
          { icon: '🥇', label: 'Wins', value: profile?.contests_won ?? 0 },
          { icon: '💰', label: 'Earnings', value: `${(profile?.total_earnings ?? 0).toFixed(2)} XLM` },
        ].map((s) => (
          <div key={s.label} className="profile-stat-card glass">
            <span className="psc-icon">{s.icon}</span>
            <span className="psc-value">{s.value}</span>
            <span className="psc-label">{s.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'runs' ? 'active' : ''}`}
          onClick={() => setActiveTab('runs')}
        >
          🏃 Run History
          {runs.length > 0 && <span className="tab-badge">{runs.length}</span>}
        </button>
        <button
          className={`profile-tab ${activeTab === 'contests' ? 'active' : ''}`}
          onClick={() => setActiveTab('contests')}
        >
          🏆 Contest History
          {contests.length > 0 && <span className="tab-badge">{contests.length}</span>}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" className="profile-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="profile-spinner" />
            <p>Loading data…</p>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div key="error" className="profile-error glass" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            ⚠️ {error}
          </motion.div>
        )}

        {!loading && !error && activeTab === 'runs' && (
          <motion.div
            key="runs"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            {runs.length === 0 ? (
              <div className="profile-empty-section">
                <span>🏃‍♂️</span>
                <p>No runs recorded yet. Start a run to see your history here.</p>
              </div>
            ) : (
              <div className="profile-table-wrapper glass">
                <table className="profile-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Distance</th>
                      <th>Duration</th>
                      <th>Avg Pace</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((run, i) => (
                      <motion.tr
                        key={run.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <td>{fmt.date(run.date)}</td>
                        <td className="highlight">{fmt.distance(run.distance_meters)}</td>
                        <td>{fmt.duration(run.duration_seconds)}</td>
                        <td>{fmt.pace(run.distance_meters, run.duration_seconds)}</td>
                        <td className="run-delete-cell">
                          {confirmId === run.id ? (
                            <span className="run-delete-confirm">
                              <button
                                className="run-delete-yes"
                                onClick={() => deleteRun(run.id)}
                                disabled={deletingId === run.id}
                              >
                                {deletingId === run.id ? '…' : 'Yes'}
                              </button>
                              <button className="run-delete-no" onClick={() => setConfirmId(null)}>No</button>
                            </span>
                          ) : (
                            <button
                              className="run-delete-btn"
                              onClick={() => setConfirmId(run.id)}
                              title="Delete run"
                            >
                              🗑
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {!loading && !error && activeTab === 'contests' && (
          <motion.div
            key="contests"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {contests.length === 0 ? (
              <div className="profile-empty-section">
                <span>🏆</span>
                <p>No contests joined yet. Enter a contest to see your results here.</p>
              </div>
            ) : (
              <div className="profile-contest-list">
                {contests.map((c, i) => (
                  <motion.div
                    key={c.id}
                    className="profile-contest-card glass"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="pcc-header">
                      <div>
                        <h4 className="pcc-title">{c.title}</h4>
                        <p className="pcc-dates">{fmt.date(c.start_date)} → {fmt.date(c.end_date)}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="pcc-metrics">
                      <div className="pcc-metric">
                        <span className="pcc-metric-label">Your Distance</span>
                        <span className="pcc-metric-value">{fmt.distance(c.current_distance || 0)}</span>
                      </div>
                      <div className="pcc-metric">
                        <span className="pcc-metric-label">Target</span>
                        <span className="pcc-metric-value">{fmt.distance(c.target_distance)}</span>
                      </div>
                      <div className="pcc-metric">
                        <span className="pcc-metric-label">Rank</span>
                        <span className="pcc-metric-value rank">
                          {c.rank_position ? `#${c.rank_position}` : '—'}
                        </span>
                      </div>
                      <div className="pcc-metric">
                        <span className="pcc-metric-label">Prize Won</span>
                        <span className="pcc-metric-value prize">
                          {c.prize_amount ? `${c.prize_amount} ${c.prize_type || 'XLM'}` : '—'}
                        </span>
                      </div>
                    </div>
                    {c.completed && (
                      <div className="pcc-completed-badge">✅ Completed</div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: { label: 'Active', cls: 'status-active' },
    completed: { label: 'Completed', cls: 'status-completed' },
    upcoming: { label: 'Upcoming', cls: 'status-upcoming' },
    cancelled: { label: 'Cancelled', cls: 'status-cancelled' },
  };
  const s = map[status] || { label: status, cls: '' };
  return <span className={`contest-status-badge ${s.cls}`}>{s.label}</span>;
}
