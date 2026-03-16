import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import LoadingScreen from './components/LoadingScreen';
import FloatingActions from './components/FloatingActions';
import ContestPage from './components/ContestPage';
import SimpleMap from './components/SimpleMap';
import BlockchainStatus from './components/BlockchainStatus';
import Leaderboard from './components/Leaderboard';
import ContestLeaderboard from './components/ContestLeaderboard';
import StellarWalletConnect from './components/StellarWalletConnect';
import SimpleWalletConnect from './components/SimpleWalletConnect';
import WalletIntegration from './components/WalletIntegration';
import GlobalNavigation from './components/GlobalNavigation';
import NavigationDemo from './components/NavigationDemo';
import FreighterStatus from './components/FreighterStatus';
import MetaMaskConnect from './components/MetaMaskConnect';
import ProfilePage from './components/ProfilePage';
import { WalletContext, useWallet } from './WalletContext';
import stellarWallet from './utils/stellarWallet';
import { isInMumbai, MUMBAI_CENTER } from './utils/mumbaiGeofence';

import './App.css';

// Stellar Network Configuration
const STELLAR_NETWORK = import.meta.env.VITE_STELLAR_NETWORK || 'testnet';
const STELLAR_HORIZON_URL = import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';

// Stellar network helper
const getStellarNetworkConfig = () => {
  return {
    network: STELLAR_NETWORK,
    horizonUrl: STELLAR_HORIZON_URL,
    networkPassphrase: STELLAR_NETWORK === 'mainnet'
      ? 'Public Global Stellar Network ; September 2015'
      : 'Test SDF Network ; September 2015'
  };
};



function App() {
  const [currentPage, setCurrentPage] = useState('loading'); // 'loading', 'landing', 'app', 'contests', 'leaderboard', 'contest-leaderboard', 'demo', or 'wallet'
  const [walletAddress, setWalletAddress] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  // Global Stellar wallet state - persists across all pages
  const [stellarWalletInfo, setStellarWalletInfo] = useState(null);
  const [stellarNetwork, setStellarNetwork] = useState(null);
  const [walletConnectionPersisted, setWalletConnectionPersisted] = useState(false);

  // MetaMask wallet state
  const [metaMaskInfo, setMetaMaskInfo] = useState(null);

  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [path, setPath] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(MUMBAI_CENTER);
  const [distance, setDistance] = useState(0);
  const [message, setMessage] = useState('');
  const [speed, setSpeed] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [heading, setHeading] = useState(0);
  const [platformStats, setPlatformStats] = useState({
    totalRuns: 1247,
    activeUsers: 89,
    totalDistance: 15420
  });
  const [lastValidPosition, setLastValidPosition] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [trackingDuration, setTrackingDuration] = useState(0);

  const watchIdRef = useRef(null);
  const lastValidPositionRef = useRef(null);
  const lastUpdateTimeRef = useRef(null);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Global wallet connection handlers - persist across all pages
  const handleStellarWalletConnect = (walletInfo) => {
    setStellarWalletInfo(walletInfo);
    setWalletAddress(walletInfo.publicKey);
    setStellarNetwork(getStellarNetworkConfig());
    setWalletConnectionPersisted(true);
    
    // Store in localStorage for persistence
    localStorage.setItem('stellarWalletInfo', JSON.stringify(walletInfo));
    localStorage.setItem('stellarWalletConnected', 'true');
    
    setMessage(`✅ Stellar Wallet Connected: ${stellarWallet.formatPublicKey ? stellarWallet.formatPublicKey(walletInfo.publicKey) : walletInfo.publicKey.slice(0, 6) + '...' + walletInfo.publicKey.slice(-4)} (${walletInfo.walletType})`);
  };

  const handleStellarWalletDisconnect = () => {
    setStellarWalletInfo(null);
    setWalletAddress('');
    setStellarNetwork(null);
    setWalletConnectionPersisted(false);
    
    // Clear localStorage
    localStorage.removeItem('stellarWalletInfo');
    localStorage.removeItem('stellarWalletConnected');
    
    setMessage('🔌 Stellar wallet disconnected');
  };

  // MetaMask handlers
  const handleMetaMaskConnect = (info) => {
    setMetaMaskInfo(info);
    if (!walletAddress) setWalletAddress(info.address);
    localStorage.setItem('metaMaskInfo', JSON.stringify(info));
    setMessage(`🦊 MetaMask Connected: ${info.address.slice(0, 6)}...${info.address.slice(-4)}`);
  };

  const handleMetaMaskDisconnect = () => {
    setMetaMaskInfo(null);
    localStorage.removeItem('metaMaskInfo');
    setMessage('🔌 MetaMask disconnected');
  };



  // Update elapsed time
  useEffect(() => {
    let interval;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  // Initialize Stellar network configuration
  useEffect(() => {
    const networkConfig = getStellarNetworkConfig();
    setStellarNetwork(networkConfig);
    console.log('✅ Stellar network initialized:', networkConfig);
  }, []);

  // Get initial location when app loads
  useEffect(() => {
    if (navigator.geolocation && !currentPosition) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = [position.coords.latitude, position.coords.longitude];
          setCurrentPosition(pos);
          setMessage('📍 Location found! Ready to start tracking.');
        },
        (error) => {
          console.log('Initial location error:', error);
          setMessage('📍 Click "Start Run" to begin GPS tracking');
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    }
  }, [currentPosition]);

  // Initialize app with loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage('landing');
    }, 3000); // Show loading for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  // Check for existing Stellar wallet connection on app load - enhanced persistence
  // Restore MetaMask connection on app load
  useEffect(() => {
    const restoreMetaMask = async () => {
      try {
        const { getMetaMaskAccount, getMetaMaskChainId, getNetworkName } = await import('./utils/metamaskWallet');
        const acc = await getMetaMaskAccount();
        if (acc) {
          const chain = await getMetaMaskChainId();
          const networkName = getNetworkName(chain);
          const info = { address: acc, chainId: chain, networkName, walletType: 'metamask' };
          setMetaMaskInfo(info);
          setWalletAddress(acc);
        }
      } catch (e) {
        console.log('MetaMask restore skipped:', e.message);
      }
    };
    restoreMetaMask();
  }, []);

  // Start tracking with enhanced GPS monitoring
  const startRun = () => {
    if (!navigator.geolocation) {
      setMessage('❌ Geolocation not supported on this device');
      return;
    }

    setIsTracking(true);
    setStartTime(Date.now());
    setPath([]);
    setDistance(0);
    setLastValidPosition(null);
    setIsMoving(false);
    setSpeed(0);
    setAccuracy(0);
    setLastUpdateTime(null);
    setMessage('🛰️ GPS tracking started... Getting your location...');

    // Reset refs for fresh tracking session
    lastValidPositionRef.current = null;
    lastUpdateTimeRef.current = null;

    // Enhanced GPS options for real-time tracking (like Google Maps)
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,       // 15 second timeout to allow GPS to get good fix
      maximumAge: 1000      // Allow 1 second old positions for more frequent updates
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude, speed, heading } = position.coords;
        const newPos = [latitude, longitude];
        const currentTime = Date.now();

        // Mumbai geo-fence check
        if (!isInMumbai(latitude, longitude)) {
          setMessage('📍 Tracking is restricted to Mumbai only. Please run within Mumbai city limits.');
          return;
        }

        // Always update current position for map centering
        setCurrentPosition(newPos);
        setAccuracy(accuracy);
        setAltitude(altitude || 0);
        setHeading(heading || 0);

        // Always update path for real-time tracking (like Google Maps)
        setPath((prevPath) => [...prevPath, newPos]);
        
        // Update tracking duration
        const currentTrackingDuration = startTime ? (currentTime - startTime) / 1000 : 0;
        setTrackingDuration(currentTrackingDuration);

        // Enhanced movement detection for status and distance calculation
        let actualSpeed = speed || 0;
        let movementDetected = false;
        let distanceFromLast = 0;

        // Use ref for last valid position to avoid stale closure
        const prevPos = lastValidPositionRef.current;

        if (prevPos) {
          distanceFromLast = calculateDistance(prevPos[0], prevPos[1], latitude, longitude);

          const baseThreshold = Math.min(accuracy * 0.3, 2);
          const maxReasonableDistance = 100;
          const minWalkingSpeed = 0.2;
          
          const speedBasedMovement = actualSpeed > minWalkingSpeed;
          const distanceBasedMovement = distanceFromLast > baseThreshold;
          const accuracyIsReasonable = accuracy < 50;
          const aggressiveMode = currentTrackingDuration > 10;

          movementDetected = speedBasedMovement || 
                           (distanceBasedMovement && accuracyIsReasonable) ||
                           (distanceFromLast > 1 && accuracy < 20) ||
                           (aggressiveMode && distanceFromLast > 0.3 && accuracy < 30);

          if (distanceFromLast > 0.5 && distanceFromLast < maxReasonableDistance) {
            if (movementDetected || accuracy < 15) {
              setDistance((prevDist) => prevDist + distanceFromLast);
              lastValidPositionRef.current = newPos;
              setLastValidPosition(newPos);
            }
          } else if (distanceFromLast > 0.2 && distanceFromLast < 5 && accuracy < 10) {
            setDistance((prevDist) => prevDist + distanceFromLast);
            lastValidPositionRef.current = newPos;
            setLastValidPosition(newPos);
            movementDetected = true;
          }

          setIsMoving(movementDetected);
        } else {
          // First position - set as reference point using ref immediately
          lastValidPositionRef.current = newPos;
          setLastValidPosition(newPos);
          setIsMoving(false);
        }

        // Update speed
        let displaySpeed = actualSpeed;
        const prevTime = lastUpdateTimeRef.current;
        
        if ((!actualSpeed || actualSpeed < 0.1) && prevPos && distanceFromLast > 0 && prevTime) {
          const timeInterval = (currentTime - prevTime) / 1000;
          if (timeInterval > 0 && timeInterval < 10) {
            displaySpeed = distanceFromLast / timeInterval;
          }
        }
        
        setSpeed(displaySpeed);
        lastUpdateTimeRef.current = currentTime;
        setLastUpdateTime(currentTime);

        const accuracyText = accuracy < 10 ? '🟢 Excellent' : accuracy < 20 ? '🟡 Good' : accuracy < 50 ? '🟠 Fair' : '🔴 Poor';
        const movementStatus = movementDetected ? '🏃‍♂️ Moving' : '⏸️ Stationary';
        const speedKmh = (displaySpeed * 3.6).toFixed(1);
        const aggressiveMode = currentTrackingDuration > 10;

        setDistance(prev => {
          const distKm = (prev / 1000).toFixed(3);
          setMessage(`📍 ${movementStatus} | ${accuracyText} GPS (±${accuracy.toFixed(0)}m) | Speed: ${speedKmh} km/h | Distance: ${distKm}km | ${aggressiveMode ? '🔥 Enhanced' : '🔄 Standard'}`);
          return prev;
        });
      },
      (error) => {
        let errorMsg = '❌ GPS Error: ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Location unavailable. Check GPS/internet connection.';
            break;
          case error.TIMEOUT:
            errorMsg += 'Location request timed out. Trying again...';
            break;
          default:
            errorMsg += error.message;
        }
        setMessage(errorMsg);
      },
      options
    );
  };

  // Stop tracking
  const stopRun = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    setIsTracking(false);

    // Validate loop
    if (path.length > 2) {
      const start = path[0];
      const end = path[path.length - 1];
      const loopDistance = calculateDistance(start[0], start[1], end[0], end[1]);

      if (loopDistance > 50) {
        setMessage(`Invalid loop! Start and end are ${loopDistance.toFixed(0)}m apart (must be < 50m)`);
      } else {
        setMessage(`Valid loop! Time: ${elapsedTime}s, Distance: ${distance.toFixed(0)}m`);
        // Auto-save run to backend if wallet is connected
        const addr = metaMaskInfo?.address || walletAddress;
        if (addr && distance > 0 && elapsedTime > 0) {
          const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          fetch(`${API_BASE}/api/profile/${addr}/runs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              distance_meters: distance,
              duration_seconds: elapsedTime,
              avg_speed: distance > 0 && elapsedTime > 0 ? distance / elapsedTime : 0,
            }),
          }).catch(() => {});
        }
      }
    }
  };

  // Submit to Stellar blockchain
  const submitToStellar = async () => {
    if (!walletAddress || !stellarWalletInfo) {
      setMessage('Please connect Stellar wallet first');
      return;
    }

    if (path.length < 2) {
      setMessage('No valid run to submit');
      return;
    }

    const start = path[0];
    const end = path[path.length - 1];
    const loopDistance = calculateDistance(start[0], start[1], end[0], end[1]);

    if (loopDistance > 50) {
      setMessage('Cannot submit invalid loop');
      return;
    }

    try {
      // Generate activity ID from starting coordinates and timestamp
      const activityId = `activity_${start[0].toFixed(4)}_${start[1].toFixed(4)}_${Date.now()}`;

      setMessage(`🔄 Submitting to Stellar ${stellarNetwork?.network || 'testnet'} network... Activity ID: ${activityId}`);

      // Prepare fitness data for Stellar blockchain
      const fitnessData = {
        activityId,
        walletAddress: stellarWalletInfo.publicKey,
        walletType: stellarWalletInfo.walletType,
        startCoords: [start[0], start[1]],
        endCoords: [end[0], end[1]],
        distance: Math.round(distance),
        time: elapsedTime,
        timestamp: Math.floor(Date.now() / 1000),
        pathLength: path.length,
        network: stellarNetwork?.network
      };

      console.log('🌟 Stellar Fitness Data:', fitnessData);

      // TODO: Implement Stellar smart contract interaction
      // This would involve creating a transaction with the fitness data
      // and submitting it to the Stellar network

      setMessage(`✅ Fitness data prepared for Stellar! Activity: ${activityId}, Time: ${elapsedTime}s, Distance: ${distance.toFixed(0)}m`);
      console.log('ℹ️ Stellar smart contract integration coming soon');

    } catch (error) {
      console.error('Blockchain submission error:', error);
      setMessage(`❌ Blockchain Error: ${error.message}`);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Smooth navigation handlers - no URL changes, instant transitions
  const handleEnterApp = () => {
    setCurrentPage('app');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };

  const handleShowContests = () => {
    setCurrentPage('contests');
  };

  const handleShowLeaderboard = () => {
    setCurrentPage('leaderboard');
  };

  const handleShowContestLeaderboard = () => {
    setCurrentPage('contest-leaderboard');
  };

  const handleShowDemo = () => {
    setCurrentPage('demo');
  };

  const handleShowWallet = () => {
    setCurrentPage('wallet');
  };

  const handleShowProfile = () => {
    setCurrentPage('profile');
  };

  const handleBackToApp = () => {
    setCurrentPage('app');
  };

  // Wallet context value - shared across all pages
  const walletContextValue = {
    walletAddress: metaMaskInfo?.address || walletAddress,
    stellarWalletInfo,
    stellarNetwork,
    walletConnectionPersisted,
    metaMaskInfo,
    isConnected: !!metaMaskInfo,
    onConnect: handleStellarWalletConnect,
    onDisconnect: handleStellarWalletDisconnect,
    onMetaMaskConnect: handleMetaMaskConnect,
    onMetaMaskDisconnect: handleMetaMaskDisconnect,
    formatAddress: (address) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
  };



  // Render with wallet context provider
  return (
    <WalletContext.Provider value={walletContextValue}>
      {currentPage === 'loading' && <LoadingScreen isVisible={true} />}
      
      <AnimatePresence mode="wait">
        {currentPage === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <LandingPage 
              onEnterApp={handleEnterApp} 
              onShowContests={handleShowContests} 
              onShowLeaderboard={handleShowLeaderboard} 
              onShowContestLeaderboard={handleShowContestLeaderboard}
              onShowDemo={handleShowDemo}
              onShowWallet={handleShowWallet}
              onShowProfile={handleShowProfile}
              walletInfo={walletContextValue}
            />
          </motion.div>
        )}

        {currentPage === 'contests' && (
          <motion.div
            key="contests"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="app"
          >
            <GlobalNavigation
              currentPage="contests"
              onNavigate={setCurrentPage}
              title="🏆 Fitness Contests"
              subtitle="Join competitions and win rewards"
            />
            <ContestPage onBack={handleBackToApp} />
          </motion.div>
        )}

        {currentPage === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="app"
          >
            <GlobalNavigation
              currentPage="leaderboard"
              onNavigate={setCurrentPage}
              title="📊 Leaderboard"
              subtitle="Track performance and view contest results"
            />
            <Leaderboard />
          </motion.div>
        )}

        {currentPage === 'contest-leaderboard' && (
          <motion.div
            key="contest-leaderboard"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="app"
          >
            <GlobalNavigation
              currentPage="contest-leaderboard"
              onNavigate={setCurrentPage}
              title="👑 Contest Champions"
              subtitle="View winners and leaderboards for each contest event"
            />
            <ContestLeaderboard />
          </motion.div>
        )}

        {currentPage === 'demo' && (
          <motion.div
            key="demo"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <NavigationDemo />
          </motion.div>
        )}

        {currentPage === 'wallet' && (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="app"
          >
            <GlobalNavigation
              currentPage="wallet"
              onNavigate={setCurrentPage}
              title="💼 Wallet"
              subtitle="Connect your MetaMask wallet"
            />
            <div className="wallet-page-container">
              <div className="wallet-section glass">
                <h3 className="wallet-section-title">🦊 MetaMask</h3>
                <MetaMaskConnect
                  onConnect={handleMetaMaskConnect}
                  onDisconnect={handleMetaMaskDisconnect}
                />
              </div>
            </div>
          </motion.div>
        )}

        {currentPage === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="app"
          >
            <GlobalNavigation
              currentPage="profile"
              onNavigate={setCurrentPage}
              title="👤 My Profile"
              subtitle="Your run history and contest results"
            />
            <ProfilePage />
          </motion.div>
        )}

        {currentPage === 'app' && (
          <motion.div
            key="app"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="app"
            data-barba="container"
            data-barba-namespace="app"
          >
            <GlobalNavigation
              currentPage="app"
              onNavigate={setCurrentPage}
              title="🏃‍♂️ FitChain"
              subtitle="Decentralized Fitness Tracking on Blockchain"
            />

        {/* Platform Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="platform-stats"
        >
          <div className="stat-card glass">
            <div className="stat-icon">🏃‍♂️</div>
            <div className="stat-number">{platformStats.totalRuns.toLocaleString()}</div>
            <div className="stat-label">Total Runs Recorded</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-icon">👥</div>
            <div className="stat-number">{platformStats.activeUsers}</div>
            <div className="stat-label">Active Runners</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-icon">🌍</div>
            <div className="stat-number">{(platformStats.totalDistance / 1000).toFixed(1)}k</div>
            <div className="stat-label">Total KM Tracked</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="map-container glass"
        >
          <div className="map-header">
            <h3>🗺️ Fitness Tracking Map</h3>
            <div className="map-status">
              {isTracking ? (
                <span className={`status-indicator ${isMoving ? 'moving' : 'stationary'}`}>
                  {isMoving ? '🏃‍♂️ Moving' : '⏸️ Stationary'}
                </span>
              ) : (
                <span className="status-indicator ready">🟢 Ready to Track</span>
              )}
            </div>
          </div>

          <SimpleMap
            isTracking={isTracking}
            currentPosition={currentPosition}
            path={path}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="stats"
        >
          {[
            { label: '⏱️ Time', value: formatTime(elapsedTime) },
            { label: '📏 Distance', value: `${distance.toFixed(0)}m` },
            { label: '🚀 Speed', value: `${(speed * 3.6 || 0).toFixed(1)} km/h` },
            { label: '🎯 GPS Accuracy', value: `±${accuracy.toFixed(0)}m` },
            { label: isTracking ? (isMoving ? '🏃‍♂️ Moving' : '⏸️ Stationary') : '📍 Points Tracked', value: isTracking ? (isMoving ? 'Yes' : 'No') : path.length },
            { label: '⚡ Avg Pace', value: `${distance > 0 && elapsedTime > 0 ? ((elapsedTime / 60) / (distance / 1000)).toFixed(1) : '0.0'} min/km` }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              className="stat glass"
            >
              <span className="label">{stat.label}</span>
              <span className="value">{stat.value}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="controls"
        >
          <AnimatePresence mode="wait">
            {!isTracking ? (
              <motion.button
                key="start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRun}
                className="btn btn-start"
              >
                Start Run
              </motion.button>
            ) : (
              <motion.button
                key="stop"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopRun}
                className="btn btn-stop"
              >
                Stop Run
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!isTracking && path.length > 0 && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={submitToStellar}
                className="btn btn-submit"
              >
                Submit to Stellar
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="message glass"
            >
              <div className="message-icon">
                {message.includes('✅') ? '✅' :
                  message.includes('❌') ? '❌' :
                    message.includes('🔄') ? '🔄' :
                      message.includes('📍') ? '📍' : '💬'}
              </div>
              <div className="message-text">{message}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Debug Panel - Remove in production */}
        {isTracking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="debug-panel glass"
          >
            <h4>🔧 GPS Debug Info</h4>
            <div className="debug-grid">
              <div className="debug-item">
                <span className="debug-label">GPS Accuracy:</span>
                <span className="debug-value">{accuracy.toFixed(1)}m</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Movement Threshold:</span>
                <span className="debug-value">{Math.min(accuracy * 0.3, 2).toFixed(1)}m</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Distance from Last:</span>
                <span className="debug-value">{lastValidPosition && currentPosition ? calculateDistance(lastValidPosition[0], lastValidPosition[1], currentPosition[0], currentPosition[1]).toFixed(1) : '0'}m</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Total Distance:</span>
                <span className="debug-value">{distance.toFixed(1)}m</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">GPS Speed:</span>
                <span className="debug-value">{(speed * 3.6).toFixed(1)} km/h</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Movement Status:</span>
                <span className={`debug-value ${isMoving ? 'moving' : 'stationary'}`}>
                  {isMoving ? '🏃‍♂️ Moving' : '⏸️ Stationary'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="info"
        >
          <p>🏃 <strong>Simple Tracking:</strong> Clean and minimal fitness tracking with grid-based visualization!</p>
          <p>📍 <strong>Live Path Display:</strong> See your exact route with connected tracking points and smooth animations.</p>
          <p>🗺️ <strong>Grid Visualization:</strong> Easy-to-read grid system shows your movement patterns clearly.</p>
        </motion.div>

        {/* Floating Action Button */}
        <FloatingActions
          onBackToLanding={handleBackToLanding}
          onShowContests={handleShowContests}
          onShowLeaderboard={handleShowLeaderboard}
          onShowContestLeaderboard={handleShowContestLeaderboard}
          onShowDemo={handleShowDemo}
          onShowWallet={handleShowWallet}
          isTracking={isTracking}
        />

            {/* Freighter Status - Development Only */}
            {process.env.NODE_ENV === 'development' && (
              <FreighterStatus />
            )}

            {/* Stellar Network Status Debug Panel */}
            <BlockchainStatus
              provider={stellarNetwork}
              networkInfo={stellarNetwork}
              walletAddress={walletAddress}
              walletType={stellarWalletInfo?.walletType}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </WalletContext.Provider>
  );
}

export default App;
