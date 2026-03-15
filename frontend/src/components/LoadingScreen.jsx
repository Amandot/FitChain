import { motion, AnimatePresence } from 'framer-motion';
import './LoadingScreen.css';

const snowDots = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 3}s`,
  duration: `${2 + Math.random() * 3}s`,
  size: `${2 + Math.random() * 3}px`,
}));

const LoadingScreen = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Snow dots */}
          <div className="loading-snow">
            {snowDots.map(d => (
              <div
                key={d.id}
                className="snow-dot"
                style={{
                  left: d.left,
                  top: '-10px',
                  width: d.size,
                  height: d.size,
                  animationDelay: d.delay,
                  animationDuration: d.duration,
                }}
              />
            ))}
          </div>

          <div className="loading-content">
            {/* Logo */}
            <div className="loading-logo">
              <span className="loading-logo-icon">🏃</span>
              <span className="loading-logo-text">FitChain</span>
            </div>

            {/* Road animation
            <div className="road-container">
              <div className="road">
                <div className="road-lines">
                  {[...Array(5)].map((_, i) => <div key={i} className="road-line" />)}
                </div>
              </div>
              <motion.div
                className="walking-man"
                animate={{ x: [-110, 110] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
              >
                <div className="man-icon">🚶‍♂️</div>
              </motion.div>
            </div> */}

            {/* Progress */}
            <div className="loading-progress">
              <div className="progress-track">
                <div className="progress-fill" />
              </div>
              <span className="progress-text">Initializing blockchain connection...</span>
            </div>

            <p className="loading-subtitle">Decentralized Fitness Tracking</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
