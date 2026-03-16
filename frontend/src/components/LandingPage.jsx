import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SnowEffect from './SnowEffect';
import './LandingPage.css';

const features = [
  { icon: '🛰️', title: 'Real-Time GPS Tracking', description: 'Professional-grade GPS accuracy with live path visualization and movement analytics.' },
  { icon: '⛓️', title: 'Blockchain Integration', description: 'Store achievements permanently on Stellar blockchain with Freighter & MetaMask support.' },
  { icon: '🏆', title: 'NFT Achievement System', description: 'Earn unique NFT rewards for completing fitness challenges and reaching milestones.' },
  { icon: '🌐', title: 'Global Community', description: 'Compete with thousands of fitness enthusiasts in the decentralized fitness revolution.' },
];

const stats = [
  { number: '1,247', label: 'Total Runs', icon: '🏃‍♂️' },
  { number: '89', label: 'Active Users', icon: '👥' },
  { number: '15.4K', label: 'KM Tracked', icon: '🌍' },
  { number: '342', label: 'NFTs Minted', icon: '🏆' },
];

const steps = [
  { step: '01', icon: '💼', title: 'Connect Wallet', description: 'Link your Freighter or MetaMask wallet to securely store achievements on-chain.' },
  { step: '02', icon: '📍', title: 'Start Tracking', description: 'Begin your workout and watch GPS track your every move in real-time.' },
  { step: '03', icon: '🏃', title: 'Complete Challenges', description: 'Finish workout loops and validate achievements with smart algorithms.' },
  { step: '04', icon: '🏆', title: 'Earn Rewards', description: 'Receive NFT achievements and tokens stored forever on the blockchain.' },
];

const LandingPage = ({ onEnterApp, onShowContests, onShowLeaderboard, onShowContestLeaderboard, onShowDemo, onShowWallet, onShowProfile, walletInfo }) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);


  useEffect(() => {
    const interval = setInterval(() => setCurrentFeature(p => (p + 1) % features.length), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="landing-page">
      <SnowEffect />

      {/* ── Top Banner ── */}
      <div className="top-banner">
        <span className="top-banner-badge">❄️ Powered by Stellar Blockchain</span>
      </div>

      {/* ── Navbar ── */}
      <motion.nav
        className={`navbar ${isScrolled ? 'scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="nav-container">
          <motion.div className="nav-logo" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <span className="logo-icon">🏃</span>
            <span className="logo-text">FitChain</span>
          </motion.div>

          <div className="nav-links">
            {[['Features', 'features'], ['How It Works', 'how-it-works'], ['Stats', 'stats']].map(([label, id]) => (
              <button key={id} className="nav-link" onClick={() => scrollTo(id)}>{label}</button>
            ))}
            <button className="nav-link" onClick={onShowContests}>Contests</button>
            <button className="nav-link" onClick={onShowLeaderboard}>Leaderboard</button>
            <button className="nav-link" onClick={onShowWallet}>Wallet</button>
            {walletInfo?.isConnected && (
              <button className="nav-link nav-link-profile" onClick={onShowProfile}>👤 Profile</button>
            )}
          </div>

          <motion.button className="nav-cta-button" onClick={onEnterApp} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            {walletInfo?.isConnected ? '🚀 Enter App' : '🚀 Launch App'}
          </motion.button>

          <button className="mobile-menu-button" onClick={() => setIsMenuOpen(o => !o)}>
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          {[['🏠 Home', () => scrollTo('hero')], ['⭐ Features', () => scrollTo('features')], ['🔧 How It Works', () => scrollTo('how-it-works')], ['📊 Stats', () => scrollTo('stats')], ['🏆 Contests', onShowContests], ['📊 Leaderboard', onShowLeaderboard], ['👑 Champions', onShowContestLeaderboard], ['💼 Wallet', onShowWallet]].map(([label, fn]) => (
            <button key={label} className="mobile-nav-link" onClick={fn}>{label}</button>
          ))}
          {walletInfo?.isConnected && (
            <button className="mobile-nav-link" onClick={onShowProfile}>👤 Profile</button>
          )}
          <button className="nav-cta-button" style={{ marginTop: 8 }} onClick={onEnterApp}>🚀 Launch App</button>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section id="hero" className="hero-section">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="hero-title">
            Transform Your<br />
            <span className="highlight">Fitness Journey</span><br />
            with Blockchain
          </h1>

          <p className="hero-subtitle">
            The world's first decentralized fitness tracking platform. Record activities, earn NFT achievements, and join a global community powered by blockchain.
          </p>

          <div className="hero-actions">
            <motion.button className="hero-btn-primary" onClick={onEnterApp} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              🚀 Start Tracking Now
            </motion.button>
            <motion.button className="hero-btn-secondary" onClick={onShowContests} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              🏆 View Contests
            </motion.button>
          </div>

          <div className="hero-stats">
            {stats.map((s, i) => (
              <motion.div key={i} className="hero-stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.1 }}>
                <span className="hero-stat-number">{s.number}</span>
                <span className="hero-stat-label">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-tag">Platform Features</span>
          <h2 className="section-title">Built for the Future</h2>
          <p className="section-subtitle">Cutting-edge technology meets fitness tracking</p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className={`feature-card ${i === currentFeature ? 'active' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              onClick={() => setCurrentFeature(i)}
              whileHover={{ y: -6 }}
            >
              <span className="feature-icon">{f.icon}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-description">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="stats-section">
        <div className="stats-inner">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="stat-block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <span className="stat-block-icon">{s.icon}</span>
              <span className="stat-block-number">{s.number}</span>
              <span className="stat-block-label">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="features-section">
        <div className="section-header">
          <span className="section-tag">Get Started</span>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Up and running in minutes</p>
        </div>

        <div className="features-grid">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: 1, textTransform: 'uppercase' }}>{s.step}</span>
                <span className="feature-icon" style={{ marginBottom: 0 }}>{s.icon}</span>
              </div>
              <h3 className="feature-title">{s.title}</h3>
              <p className="feature-description">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="cta-section">
        <motion.div
          className="cta-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="cta-title">Ready to Start Your Journey?</h2>
          <p className="cta-subtitle">Join thousands of fitness enthusiasts already using FitChain to track, validate, and reward their achievements.</p>
          <div className="cta-actions">
            <motion.button className="hero-btn-primary" onClick={onEnterApp} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              🚀 Launch FitChain
            </motion.button>
            <motion.button className="hero-btn-secondary" onClick={onShowContests} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              🏆 Join Contests
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <span>🏃</span>
            <span className="footer-logo-text">FitChain</span>
          </div>
          <span className="footer-copy">© 2024 FitChain. Decentralized Fitness Tracking.</span>
          <div className="footer-links">
            <button className="footer-link" onClick={onShowContests}>Contests</button>
            <button className="footer-link" onClick={onShowLeaderboard}>Leaderboard</button>
            <button className="footer-link" onClick={onShowWallet}>Wallet</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
