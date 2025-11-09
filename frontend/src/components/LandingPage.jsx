import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = ({ onEnterApp, onShowContests, onShowLeaderboard, onShowContestLeaderboard, onShowDemo, onShowWallet, walletInfo }) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const features = [
    {
      icon: '🏃‍♂️',
      title: 'Real-Time GPS Tracking',
      description: 'Track your fitness journey with professional-grade GPS accuracy and live path visualization.'
    },
    {
      icon: '🔗',
      title: 'Blockchain Integration',
      description: 'Store your achievements permanently on Ethereum blockchain with MetaMask integration.'
    },
    {
      icon: '🏆',
      title: 'Achievement System',
      description: 'Earn NFT rewards for completing fitness challenges and reaching new milestones.'
    },
    {
      icon: '🌍',
      title: 'Global Community',
      description: 'Join thousands of fitness enthusiasts in the decentralized fitness revolution.'
    }
  ];

  const stats = [
    { number: '1,247', label: 'Total Runs', icon: '🏃‍♂️' },
    { number: '89', label: 'Active Users', icon: '👥' },
    { number: '15.4K', label: 'KM Tracked', icon: '🌍' },
    { number: '342', label: 'NFTs Minted', icon: '🏆' }
  ];

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="landing-page" data-barba="container" data-barba-namespace="landing">
      {/* Navigation Bar */}
      <motion.nav
        className={`navbar ${isScrolled ? 'scrolled' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="nav-container">
          {/* Logo */}
          <motion.div
            className="nav-logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="logo-icon">🏃</span>
            <span className="logo-text">FitChain</span>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="nav-links">
            <motion.button
              className="nav-link"
              onClick={() => scrollToSection('hero')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Home
            </motion.button>
            <motion.button
              className="nav-link"
              onClick={() => scrollToSection('features')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Features
            </motion.button>
            <motion.button
              className="nav-link"
              onClick={() => scrollToSection('how-it-works')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              How It Works
            </motion.button>
            <motion.button
              className="nav-link"
              onClick={() => scrollToSection('stats')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Stats
            </motion.button>
            <motion.button
              className="nav-link"
              onClick={onShowContests}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contests
            </motion.button>
            <motion.button
              className="nav-link"
              onClick={onShowLeaderboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Leaderboard
            </motion.button>
            <motion.button
              className="nav-link"
              onClick={onShowContestLeaderboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Champions
            </motion.button>
            <motion.button
              className="nav-link"
              onClick={onShowDemo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Demo
            </motion.button>
            <motion.button
              className="nav-link"
              onClick={onShowWallet}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Wallet
            </motion.button>
          </div>

          {/* Wallet Status & CTA Button */}
          <div className="nav-cta-section">
            {walletInfo?.isConnected && (
              <div className="nav-wallet-status">
                <span className="wallet-indicator">🚀</span>
                <span className="wallet-text">{walletInfo.formatAddress(walletInfo.walletAddress)}</span>
              </div>
            )}
            <motion.button
              className="nav-cta-button"
              onClick={onEnterApp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {walletInfo?.isConnected ? '🚀 Enter App' : '🚀 Launch App'}
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="mobile-menu-button"
            onClick={toggleMenu}
            whileTap={{ scale: 0.95 }}
          >
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}
          initial={false}
          animate={{
            height: isMenuOpen ? 'auto' : 0,
            opacity: isMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="mobile-menu-content">
            <button className="mobile-nav-link" onClick={() => scrollToSection('hero')}>
              🏠 Home
            </button>
            <button className="mobile-nav-link" onClick={() => scrollToSection('features')}>
              ⭐ Features
            </button>
            <button className="mobile-nav-link" onClick={() => scrollToSection('how-it-works')}>
              🔧 How It Works
            </button>
            <button className="mobile-nav-link" onClick={() => scrollToSection('stats')}>
              📊 Stats
            </button>
            <button className="mobile-nav-link" onClick={onShowContests}>
              🏆 Contests
            </button>
            <button className="mobile-nav-link" onClick={onShowLeaderboard}>
              📊 Leaderboard
            </button>
            <button className="mobile-nav-link" onClick={onShowContestLeaderboard}>
              👑 Champions
            </button>
            <button className="mobile-nav-link" onClick={onShowDemo}>
              🎯 Navigation Demo
            </button>
            <button className="mobile-nav-link" onClick={onShowWallet}>
              💼 Wallet & Payments
            </button>
            <button className="mobile-nav-cta" onClick={onEnterApp}>
              {walletInfo?.isConnected ? '🚀 Enter App' : '🚀 Launch App'}
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hero-text"
          >
            <h1 className="hero-title">
              <span className="title-line">Transform Your</span>
              <span className="title-line gradient-text  " id='one'>Fitness Journey</span>
              <span className="title-line">with Blockchain</span>
            </h1>

            <p className="hero-subtitle">
              The world's first decentralized fitness tracking platform.
              Record your activities, earn NFT achievements, and join a global community
              of fitness enthusiasts powered by Ethereum blockchain.
            </p>

            <div className="hero-buttons">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEnterApp}
                className="cta-button primary"
              >
                🚀 Start Tracking Now
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cta-button secondary"
              >
                📖 Learn More
              </motion.button>
            </div>
          </motion.div>


        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="stats-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="stats-grid"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="stat-card"
              >
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2 className="section-title">Revolutionary Features</h2>
            <p className="section-subtitle">
              Experience the future of fitness tracking with cutting-edge technology
            </p>
          </motion.div>

          <div className="features-showcase">
            <div className="features-list">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`feature-item ${index === currentFeature ? 'active' : ''}`}
                  onClick={() => setCurrentFeature(index)}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-content">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              key={currentFeature}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="feature-visual"
            >
              <div className="feature-showcase-card">
                <div className="showcase-icon">{features[currentFeature].icon}</div>
                <h3>{features[currentFeature].title}</h3>
                <p>{features[currentFeature].description}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Get started in minutes and transform your fitness journey
            </p>
          </motion.div>

          <div className="steps-grid">
            {[
              {
                step: '01',
                title: 'Connect Wallet',
                description: 'Link your Freighter wallet to securely store your fitness achievements on the blockchain.',
                icon: '💼'
              },
              {
                step: '02',
                title: 'Start Tracking',
                description: 'Begin your workout and watch as our GPS technology tracks your every move in real-time.',
                icon: '📍'
              },
              {
                step: '03',
                title: 'Complete Challenges',
                description: 'Finish your workout loops and validate your achievements with our smart algorithms.',
                icon: '🏃'
              },
              {
                step: '04',
                title: 'Earn Rewards',
                description: 'Receive NFT achievements and tokens for your fitness milestones stored forever on blockchain.',
                icon: '🏆'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="step-card"
              >
                <div className="step-number">{step.step}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="cta-content"
          >
            <h2 className="cta-title">Ready to Start Your Journey?</h2>
            <p className="cta-subtitle">
              Join thousands of fitness enthusiasts already using FitChain to track,
              validate, and reward their fitness achievements.
            </p>

            <div className="cta-buttons">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEnterApp}
                className="cta-button primary large"
              >
                🚀 Launch FitChain App
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onShowContests}
                className="cta-button secondary large"
              >
                🏆 Join Contests
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>🏃‍♂️ FitChain</h3>
              <p>Decentralized Fitness Tracking</p>
            </div>

            <div className="footer-links">
              <div className="link-group">
                <h4>Platform</h4>
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#roadmap">Roadmap</a>
              </div>

              <div className="link-group">
                <h4>Community</h4>
                <a href="#discord">Discord</a>
                <a href="#twitter">Twitter</a>
                <a href="#github">GitHub</a>
              </div>

              <div className="link-group">
                <h4>Resources</h4>
                <a href="#docs">Documentation</a>
                <a href="#api">API</a>
                <a href="#support">Support</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 FitChain. Built with ❤️ for the decentralized fitness community.</p>
          </div>
        </div>
      </footer>
    </div >
  );
};

export default LandingPage;