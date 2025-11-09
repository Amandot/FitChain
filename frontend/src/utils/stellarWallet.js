import {
  isConnected,
  getAddress,
  requestAccess,
  setAllowed,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";

export async function connectWallet() {
  try {
    console.log("Attempting to connect wallet...");

    // First, request access/permission
    try {
      console.log("Requesting wallet access...");
      await requestAccess();
      console.log("Access granted");
    } catch (accessError) {
      console.log(
        "requestAccess not available or failed, trying setAllowed..."
      );
      try {
        await setAllowed();
      } catch (setAllowedError) {
        console.log("setAllowed also failed, continuing anyway...");
      }
    }

    // Now get the public key using the new API
    const result = await getAddress();
    console.log("Wallet connection result:", result);

    if (result.error) {
      console.error("Error retrieving public key:", result.error);
      alert(
        `Error connecting to wallet: ${result.error}\n\nPlease:\n1. Open Freighter extension\n2. Make sure you have an account created\n3. Make sure the account is unlocked\n4. Try connecting again`
      );
      return null;
    }

    const publicKey = result.address;
    if (!publicKey || publicKey === "") {
      console.error("No public key returned from wallet");
      alert(
        "No address returned from wallet.\n\nPlease:\n1. Open Freighter extension\n2. Make sure you have an account created\n3. Make sure the account is unlocked\n4. Try connecting again"
      );
      return null;
    }

    console.log("Successfully connected to wallet:", publicKey);
    return publicKey;
  } catch (error) {
    console.error("Wallet connection error:", error);
    alert(
      `Failed to connect wallet: ${
        error instanceof Error ? error.message : "Unknown error"
      }\n\nMake sure Freighter is installed and unlocked.`
    );
    return null;
  }
}

export async function signTransaction(xdr, networkPassphrase) {
  try {
    console.log("🔏 Signing transaction...");
    const result = await freighterSignTransaction(xdr, {
      networkPassphrase,
    });

    console.log("🔏 Sign result:", result);

    if (!result) {
      throw new Error("No result from Freighter");
    }

    if (result.error) {
      throw new Error(result.error);
    }

    if (!result.signedTxXdr) {
      throw new Error("No signed transaction returned from Freighter");
    }

    console.log("✅ Transaction signed successfully");
    return result.signedTxXdr;
  } catch (error) {
    console.error("❌ Transaction signing error:", error);
    throw error;
  }
}

export async function isWalletInstalled() {
  try {
    console.log("Checking if wallet is installed...");
    const connected = await isConnected();
    console.log("Wallet installed:", connected);
    return connected;
  } catch (error) {
    console.error("Error checking wallet installation:", error);
    return false;
  }
}

export { getAddress };

// Enhanced Stellar Wallet Manager Class for backward compatibility
class StellarWalletManager {
  constructor() {
    this.publicKey = null;
    this.network = null;
    this.isConnecting = false;
    this.connectionListeners = [];
  }

  // Enhanced connection method using the new API
  async connect() {
    if (this.isConnecting) {
      throw new Error("Connection already in progress");
    }

    this.isConnecting = true;

    try {
      console.log("🔄 Starting wallet connection...");

      // Use the new connectWallet function
      const publicKey = await connectWallet();

      if (!publicKey) {
        throw new Error("Failed to connect wallet");
      }

      // Store connection info
      this.publicKey = publicKey;
      this.network = "testnet"; // Default network

      // Store in localStorage for persistence
      localStorage.setItem("stellarWallet_publicKey", publicKey);
      localStorage.setItem("stellarWallet_network", this.network);
      localStorage.setItem("stellarWallet_connected", "true");

      // Notify listeners
      this.notifyConnectionListeners(true, {
        publicKey,
        network: this.network,
      });

      console.log("🎉 Wallet connected successfully!");

      return {
        success: true,
        publicKey,
        network: this.network,
        message: `Connected: ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`,
      };
    } catch (error) {
      console.error("❌ Connection failed:", error);

      // Clear any stored connection data
      this.clearStoredConnection();

      return {
        success: false,
        error: error.message,
        message: error.message,
      };
    } finally {
      this.isConnecting = false;
    }
  }

  // Check for existing connection on page load
  async checkExistingConnection() {
    try {
      const storedPublicKey = localStorage.getItem("stellarWallet_publicKey");
      const storedNetwork = localStorage.getItem("stellarWallet_network");
      const isConnectedStored =
        localStorage.getItem("stellarWallet_connected") === "true";

      if (storedPublicKey && isConnectedStored) {
        // Verify the connection is still valid using new API
        const walletInstalled = await isWalletInstalled();
        if (walletInstalled) {
          const result = await getAddress();
          if (!result.error && result.address === storedPublicKey) {
            this.publicKey = storedPublicKey;
            this.network = storedNetwork || "testnet";

            console.log(
              "🔄 Restored wallet connection:",
              this.formatPublicKey(storedPublicKey)
            );
            this.notifyConnectionListeners(true, {
              publicKey: storedPublicKey,
              network: this.network,
            });

            return {
              success: true,
              publicKey: storedPublicKey,
              network: this.network,
              message: "Connection restored",
            };
          }
        }
      }

      // Clear invalid stored data
      this.clearStoredConnection();
      return { success: false, message: "No existing connection" };
    } catch (error) {
      console.log("Connection check failed:", error);
      this.clearStoredConnection();
      return { success: false, message: "Connection check failed" };
    }
  }

  // Clear stored connection data
  clearStoredConnection() {
    localStorage.removeItem("stellarWallet_publicKey");
    localStorage.removeItem("stellarWallet_network");
    localStorage.removeItem("stellarWallet_connected");
  }

  // Disconnect
  disconnect() {
    this.publicKey = null;
    this.network = null;
    this.clearStoredConnection();
    this.notifyConnectionListeners(false, null);
    console.log("🔌 Wallet disconnected");
    return { success: true, message: "Disconnected" };
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: !!this.publicKey,
      publicKey: this.publicKey,
      network: this.network,
      isConnecting: this.isConnecting,
    };
  }

  // Format public key for display
  formatPublicKey(publicKey) {
    if (!publicKey) return "Not Connected";
    return `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`;
  }

  // Check if Freighter is available
  async isFreighterAvailable() {
    return await isWalletInstalled();
  }

  // Add connection listener
  addConnectionListener(callback) {
    this.connectionListeners.push(callback);
  }

  // Remove connection listener
  removeConnectionListener(callback) {
    this.connectionListeners = this.connectionListeners.filter(
      (cb) => cb !== callback
    );
  }

  // Notify connection listeners
  notifyConnectionListeners(isConnected, walletInfo) {
    this.connectionListeners.forEach((callback) => {
      try {
        callback(isConnected, walletInfo);
      } catch (error) {
        console.error("Connection listener error:", error);
      }
    });
  }

  // Auto-check connection status
  startConnectionMonitoring() {
    // Check every 5 seconds if wallet is still connected
    setInterval(async () => {
      if (this.publicKey) {
        try {
          const walletInstalled = await isWalletInstalled();
          if (!walletInstalled) {
            console.log("⚠️ Wallet connection lost");
            this.disconnect();
          }
        } catch (error) {
          console.log("Connection monitoring error:", error);
        }
      }
    }, 5000);
  }
}

// Create and export singleton instance
const stellarWallet = new StellarWalletManager();

// Auto-check for existing connection when module loads
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    setTimeout(() => {
      stellarWallet.checkExistingConnection();
      stellarWallet.startConnectionMonitoring();
    }, 1000);
  });
}

export { stellarWallet };
export default stellarWallet;
