// Simple and Reliable Stellar Wallet Connection
import {
  getAddress,
  requestAccess,
  isAllowed,
  getNetwork,
} from "@stellar/freighter-api";

class SimpleWalletManager {
  constructor() {
    this.publicKey = null;
    this.network = null;
    this.isConnecting = false;
  }

  // Simple connection method
  async connect() {
    if (this.isConnecting) {
      return { success: false, error: "Connection already in progress" };
    }

    this.isConnecting = true;

    try {
      // Request access using the modern API
      const accessResult = await requestAccess();
      if (accessResult.error) {
        throw new Error(`Connection rejected: ${accessResult.error}`);
      }

      // Wait a moment
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check permission
      const allowedResult = await isAllowed();
      if (!allowedResult) {
        throw new Error("Connection rejected");
      }

      // Get public key using the new API
      const addressResult = await getAddress();
      if (addressResult.error) {
        throw new Error(`Failed to get address: ${addressResult.error}`);
      }

      const publicKey = addressResult.address;
      if (!publicKey) {
        throw new Error("No account found");
      }

      // Get network
      let network = "testnet";
      try {
        const networkResult = await getNetwork();
        if (!networkResult.error) {
          network = networkResult.network;
        }
      } catch (e) {
        console.warn("Could not get network");
      }

      // Store connection
      this.publicKey = publicKey;
      this.network = network;

      return {
        success: true,
        publicKey,
        network,
        message: `Connected: ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: error.message,
      };
    } finally {
      this.isConnecting = false;
    }
  }

  // Disconnect
  disconnect() {
    this.publicKey = null;
    this.network = null;
    return { success: true, message: "Disconnected" };
  }

  // Get status
  getConnectionStatus() {
    return {
      isConnected: !!this.publicKey,
      publicKey: this.publicKey,
      network: this.network,
      isConnecting: this.isConnecting,
    };
  }

  // Format address
  formatPublicKey(publicKey) {
    if (!publicKey) return "Not Connected";
    return `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`;
  }

  // Check if available
  async isFreighterAvailable() {
    try {
      // Try to check if Freighter is available using the modern API
      const result = await isAllowed();
      return true; // If we can call the API, Freighter is available
    } catch (error) {
      return false;
    }
  }
}

// Export singleton
const simpleWallet = new SimpleWalletManager();
export default simpleWallet;
