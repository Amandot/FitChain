import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../WalletContext';
import './GlobalNavigation.css';

const GlobalNavigation = ({
  currentPage,
  onNavigate,
  showBackButton = true,
  title,
  subtitle
}) => {
  const wallet = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getBackDestination = () => {
    if (currentPage === 'landing') return null;
    if (currentPage === 'app') return 'landing';
    return 'app';
  };

  const getBackLabel = () => {
    const dest = getBackDestination();
    if (!dest) return null;
    return dest === 'landing' ? '← Landing' : '← App';
  };

  const isConnected = !!wallet?.metaMaskInfo;
  const address = wallet?.metaMaskInfo?.address;

  const handleDisconnect = () => {
    setDropdownOpen(false);
    wallet?.onMetaMaskDisconnect?.();
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="global-navigation"
    >
      <div className="nav-content">
        <div className="nav-left">
          {showBackButton && getBackDestination() && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(getBackDestination())}
              className="nav-back-button"
            >
              {getBackLabel()}
            </motion.button>
          )}

          {title && (
            <div className="nav-title-section">
              <h1 className="nav-title">{title}</h1>
              {subtitle && <p className="nav-subtitle">{subtitle}</p>}
            </div>
          )}
        </div>

        <div className="nav-right">
          <div className="wallet-status">
            {isConnected ? (
              <div className="wallet-dropdown-wrapper">
                <button
                  className="connection-indicator connected wallet-pill-btn"
                  onClick={() => setDropdownOpen(o => !o)}
                  aria-expanded={dropdownOpen}
                >
                  <span className="indicator-dot pulse" />
                  <span className="wallet-address-short">
                    {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Connected'}
                  </span>
                  <span className="wallet-chevron">{dropdownOpen ? '▲' : '▼'}</span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="wallet-dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        className="wallet-dropdown"
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="wallet-dropdown-address">
                          🦊 {address ? `${address.slice(0, 10)}…${address.slice(-6)}` : 'MetaMask'}
                        </div>
                        <button
                          className="wallet-dropdown-profile-btn"
                          onClick={() => { setDropdownOpen(false); onNavigate('profile'); }}
                        >
                          👤 My Profile
                        </button>
                        <button className="wallet-disconnect-btn" onClick={handleDisconnect}>
                          Disconnect
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="connection-indicator disconnected">
                <span className="indicator-dot" />
                <span>No Wallet</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default GlobalNavigation;
