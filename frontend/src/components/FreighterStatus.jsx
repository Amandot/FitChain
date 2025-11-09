import React, { useState, useEffect } from 'react';
import './FreighterStatus.css';

const FreighterStatus = () => {
  const [status, setStatus] = useState({
    installed: false,
    connected: false,
    publicKey: null,
    network: null,
    lastCheck: null
  });

  useEffect(() => {
    checkStatus();
    
    // Check status every 3 seconds
    const interval = setInterval(checkStatus, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    const newStatus = {
      installed: !!window.freighter,
      connected: false,
      publicKey: null,
      network: null,
      lastCheck: new Date().toLocaleTimeString()
    };

    if (newStatus.installed) {
      try {
        const isAllowed = await window.freighter.isAllowed();
        if (isAllowed) {
          newStatus.connected = true;
          newStatus.publicKey = await window.freighter.getPublicKey();
          newStatus.network = await window.freighter.getNetwork();
        }
      } catch (error) {
        console.log('Status check error:', error);
      }
    }

    setStatus(newStatus);
  };

  return (
    <div className="freighter-status">
      <div className="status-header">
        <span className="status-title">🚀 Wallet Status</span>
        <span className="last-check">Updated: {status.lastCheck}</span>
      </div>
      
      <div className="status-indicators">
        <div className={`status-item ${status.installed ? 'success' : 'error'}`}>
          <span className="indicator-dot"></span>
          <span>Extension {status.installed ? 'Installed' : 'Not Found'}</span>
        </div>
        
        <div className={`status-item ${status.connected ? 'success' : 'warning'}`}>
          <span className="indicator-dot"></span>
          <span>Wallet {status.connected ? 'Connected' : 'Disconnected'}</span>
        </div>
        
        {status.connected && (
          <>
            <div className="status-item success">
              <span className="indicator-dot"></span>
              <span>Account: {status.publicKey?.slice(0, 6)}...{status.publicKey?.slice(-4)}</span>
            </div>
            
            <div className="status-item info">
              <span className="indicator-dot"></span>
              <span>Network: {status.network}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FreighterStatus;