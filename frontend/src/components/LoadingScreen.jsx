import { motion } from 'framer-motion';
import './LoadingScreen.css';

const LoadingScreen = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="loading-screen"
    >
      <div className="loading-content">
        {/* Road Animation */}
        <div className="road-container">
          <div className="road">
            <div className="road-lines">
              <div className="road-line"></div>
              <div className="road-line"></div>
              <div className="road-line"></div>
              <div className="road-line"></div>
              <div className="road-line"></div>
            </div>
          </div>
          
          {/* Walking Man Animation */}
          <motion.div
            animate={{
              x: [-120, 120],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
            className="walking-man"
          >
            <motion.div
              animate={{
                rotateY: [0, 5, -5, 0],
                scale: [1, 1.05, 1, 1.05, 1]
              }}
              transition={{
                rotateY: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="man-icon"
            >
              🚶‍♂️
            </motion.div>
          </motion.div>
          
          {/* Road Side Elements */}
          <div className="road-side-elements">
            <div className="tree left">🌳</div>
            <div className="tree right">🌳</div>
          </div>
        </div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="loading-title"
        >
          FitChain
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="loading-subtitle"
        >
          Starting your fitness journey...
        </motion.p>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="loading-bar"
        >
          <div className="loading-progress"></div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;