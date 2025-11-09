import { signTransaction } from "./stellarWallet";

// Stellar network configuration
const STELLAR_NETWORK = import.meta.env.VITE_STELLAR_NETWORK || "testnet";
const STELLAR_HORIZON_URL =
  import.meta.env.VITE_STELLAR_HORIZON_URL ||
  "https://horizon-testnet.stellar.org";

/**
 * Simulate XLM payment to a recipient (Demo version)
 * @param {string} senderWallet - Sender's wallet address
 * @param {string} recipientWallet - Recipient's wallet address
 * @param {string} amount - Amount to send in XLM
 * @param {string} memo - Optional memo for the transaction
 * @returns {Promise<Object>} Transaction result
 */
export async function sendXLMPayment(
  senderWallet,
  recipientWallet,
  amount,
  memo = ""
) {
  try {
    console.log(
      `💰 Simulating XLM payment: ${amount} XLM from ${senderWallet} to ${recipientWallet}`
    );

    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock transaction hash
    const mockTxHash = `tx_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log("✅ Payment simulation successful:", mockTxHash);

    return {
      success: true,
      transactionHash: mockTxHash,
      amount: amount,
      recipient: recipientWallet,
      memo: memo,
      network: STELLAR_NETWORK,
    };
  } catch (error) {
    console.error("❌ Payment simulation failed:", error);

    return {
      success: false,
      error: error.message,
      amount: amount,
      recipient: recipientWallet,
    };
  }
}

/**
 * Distribute contest prizes to multiple winners (Demo version)
 * @param {string} senderWallet - Contest organizer's wallet
 * @param {Array} winners - Array of winner objects with wallet and prize amount
 * @param {string} contestId - Contest identifier for memo
 * @returns {Promise<Array>} Array of payment results
 */
export async function distributeContestPrizes(
  senderWallet,
  winners,
  contestId
) {
  const results = [];

  console.log(
    `🏆 Simulating prize distribution for Contest #${contestId} to ${winners.length} winners`
  );

  for (const winner of winners) {
    try {
      const memo = `Contest #${contestId} Prize - Rank ${winner.rank}`;

      const result = await sendXLMPayment(
        senderWallet,
        winner.wallet,
        winner.amount,
        memo
      );

      results.push({
        ...result,
        winner: winner.name,
        rank: winner.rank,
        wallet: winner.wallet,
      });

      // Add delay between transactions
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to send prize to ${winner.name}:`, error);

      results.push({
        success: false,
        error: error.message,
        winner: winner.name,
        rank: winner.rank,
        wallet: winner.wallet,
        amount: winner.amount,
      });
    }
  }

  return results;
}

/**
 * Get account balance for a Stellar wallet (Demo version)
 * @param {string} walletAddress - Stellar wallet address
 * @returns {Promise<Object>} Account balance information
 */
export async function getAccountBalance(walletAddress) {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock balance data
    const mockBalance = Math.random() * 1000 + 100; // Random balance between 100-1100 XLM

    return {
      success: true,
      balances: [
        {
          asset: "XLM",
          balance: mockBalance,
          limit: null,
        },
      ],
      accountId: walletAddress,
    };
  } catch (error) {
    console.error("❌ Failed to get account balance:", error);

    return {
      success: false,
      error: error.message,
      accountId: walletAddress,
    };
  }
}

/**
 * Validate Stellar wallet address format
 * @param {string} address - Wallet address to validate
 * @returns {boolean} Whether address is valid
 */
export function isValidStellarAddress(address) {
  // Basic validation - starts with G and is 56 characters
  return address && address.length === 56 && address.startsWith("G");
}

/**
 * Format XLM amount for display
 * @param {number} amount - Amount in XLM
 * @returns {string} Formatted amount string
 */
export function formatXLMAmount(amount) {
  return `${parseFloat(amount).toFixed(2)} XLM`;
}

/**
 * Get transaction details from hash (Demo version)
 * @param {string} transactionHash - Transaction hash
 * @returns {Promise<Object>} Transaction details
 */
export async function getTransactionDetails(transactionHash) {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      transaction: {
        hash: transactionHash,
        created_at: new Date().toISOString(),
        successful: true,
      },
      hash: transactionHash,
    };
  } catch (error) {
    console.error("❌ Failed to get transaction details:", error);

    return {
      success: false,
      error: error.message,
      hash: transactionHash,
    };
  }
}

// Contest prize distribution presets
export const CONTEST_PRIZES = {
  MUMBAI_MARATHON: {
    1: { amount: 300, percentage: 60 }, // 1st place: 300 XLM (60%)
    2: { amount: 150, percentage: 30 }, // 2nd place: 150 XLM (30%)
    3: { amount: 50, percentage: 10 }, // 3rd place: 50 XLM (10%)
  },
  STANDARD_CONTEST: {
    1: { amount: 60, percentage: 60 }, // 1st place: 60 XLM (60%)
    2: { amount: 30, percentage: 30 }, // 2nd place: 30 XLM (30%)
    3: { amount: 10, percentage: 10 }, // 3rd place: 10 XLM (10%)
  },
};

/**
 * Calculate prize distribution for a contest
 * @param {number} totalPrizePool - Total prize pool in XLM
 * @param {string} contestType - Type of contest (MUMBAI_MARATHON, STANDARD_CONTEST)
 * @param {number} numWinners - Number of winners (default 3)
 * @returns {Array} Prize distribution array
 */
export function calculatePrizeDistribution(
  totalPrizePool,
  contestType = "STANDARD_CONTEST",
  numWinners = 3
) {
  const prizeStructure =
    CONTEST_PRIZES[contestType] || CONTEST_PRIZES.STANDARD_CONTEST;
  const distribution = [];

  for (let rank = 1; rank <= numWinners; rank++) {
    const prizeInfo = prizeStructure[rank];
    if (prizeInfo) {
      const amount = (totalPrizePool * prizeInfo.percentage) / 100;
      distribution.push({
        rank: rank,
        amount: amount,
        percentage: prizeInfo.percentage,
      });
    }
  }

  return distribution;
}
