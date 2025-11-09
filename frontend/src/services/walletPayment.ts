// Wallet Payment Service
export interface PaymentRequest {
  recipient: string;
  amount: number;
  currency: string;
  description?: string;
  memo?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  timestamp: Date;
}

export interface WalletBalance {
  currency: string;
  amount: number;
  usdValue: number;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  recipient: string;
  sender: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  type: 'send' | 'receive';
  description?: string;
  transactionHash?: string;
}

class WalletPaymentService {
  private static instance: WalletPaymentService;
  private payments: PaymentHistory[] = [];
  private balances: Map<string, number> = new Map();

  private constructor() {
    // Initialize with mock balances
    this.balances.set('XLM', 1250.75);
    this.balances.set('USDC', 500.00);
    this.balances.set('BTC', 0.025);
  }

  public static getInstance(): WalletPaymentService {
    if (!WalletPaymentService.instance) {
      WalletPaymentService.instance = new WalletPaymentService();
    }
    return WalletPaymentService.instance;
  }

  // Get wallet balances
  public async getBalances(): Promise<WalletBalance[]> {
    // Mock exchange rates
    const exchangeRates = {
      XLM: 0.125,
      USDC: 1.00,
      BTC: 43500.00
    };

    return Array.from(this.balances.entries()).map(([currency, amount]) => ({
      currency,
      amount,
      usdValue: amount * (exchangeRates[currency as keyof typeof exchangeRates] || 0)
    }));
  }

  // Send payment
  public async sendPayment(
    walletAddress: string,
    paymentRequest: PaymentRequest
  ): Promise<PaymentResult> {
    try {
      // Validate payment request
      if (!paymentRequest.recipient || !paymentRequest.amount || paymentRequest.amount <= 0) {
        throw new Error('Invalid payment request');
      }

      // Check balance
      const currentBalance = this.balances.get(paymentRequest.currency) || 0;
      if (currentBalance < paymentRequest.amount) {
        throw new Error('Insufficient balance');
      }

      // Validate recipient address (basic Stellar address validation)
      if (!this.isValidStellarAddress(paymentRequest.recipient)) {
        throw new Error('Invalid recipient address');
      }

      // Create payment record
      const payment: PaymentHistory = {
        id: this.generatePaymentId(),
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        recipient: paymentRequest.recipient,
        sender: walletAddress,
        timestamp: new Date(),
        status: 'pending',
        type: 'send',
        description: paymentRequest.description || 'Payment'
      };

      // Add to payment history
      this.payments.unshift(payment);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate payment processing with Freighter/Stellar
      const result = await this.processPaymentWithFreighter(paymentRequest);

      if (result.success) {
        // Update balance
        this.balances.set(
          paymentRequest.currency,
          currentBalance - paymentRequest.amount
        );

        // Update payment status
        const updatedPayment = {
          ...payment,
          status: 'completed' as const,
          transactionHash: result.transactionHash
        };

        this.updatePaymentStatus(payment.id, updatedPayment);

        return {
          success: true,
          transactionHash: result.transactionHash,
          timestamp: new Date()
        };
      } else {
        // Update payment status to failed
        this.updatePaymentStatus(payment.id, { ...payment, status: 'failed' });
        throw new Error(result.error || 'Payment failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  // Process payment with Freighter wallet
  private async processPaymentWithFreighter(
    paymentRequest: PaymentRequest
  ): Promise<PaymentResult> {
    try {
      if (!window.freighter) {
        throw new Error('Freighter wallet not available');
      }

      // Check if wallet is connected
      const isAllowed = await window.freighter.isAllowed();
      if (!isAllowed) {
        throw new Error('Wallet not connected');
      }

      // Get sender's public key
      const senderPublicKey = await window.freighter.getPublicKey();
      if (!senderPublicKey) {
        throw new Error('Unable to get wallet address');
      }

      // For now, simulate the transaction
      // In a real implementation, you would use Stellar SDK to create and submit the transaction
      const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`;

      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;

      if (success) {
        return {
          success: true,
          transactionHash: mockTransactionHash,
          timestamp: new Date()
        };
      } else {
        throw new Error('Transaction failed on network');
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
        timestamp: new Date()
      };
    }
  }

  // Get payment history
  public getPaymentHistory(): PaymentHistory[] {
    return [...this.payments];
  }

  // Add received payment (for demo purposes)
  public addReceivedPayment(
    walletAddress: string,
    amount: number,
    currency: string,
    sender: string,
    description?: string
  ): void {
    const payment: PaymentHistory = {
      id: this.generatePaymentId(),
      amount,
      currency,
      recipient: walletAddress,
      sender,
      timestamp: new Date(),
      status: 'completed',
      type: 'receive',
      description: description || 'Received payment',
      transactionHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`
    };

    this.payments.unshift(payment);

    // Update balance
    const currentBalance = this.balances.get(currency) || 0;
    this.balances.set(currency, currentBalance + amount);
  }

  // Validate Stellar address format
  private isValidStellarAddress(address: string): boolean {
    // Basic Stellar address validation
    // Real implementation should use Stellar SDK for proper validation
    return /^G[A-Z2-7]{55}$/.test(address);
  }

  // Generate unique payment ID
  private generatePaymentId(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Update payment status
  private updatePaymentStatus(paymentId: string, updatedPayment: PaymentHistory): void {
    const index = this.payments.findIndex(p => p.id === paymentId);
    if (index !== -1) {
      this.payments[index] = updatedPayment;
    }
  }

  // Clear payment history (for testing)
  public clearPaymentHistory(): void {
    this.payments = [];
  }

  // Reset balances (for testing)
  public resetBalances(): void {
    this.balances.set('XLM', 1250.75);
    this.balances.set('USDC', 500.00);
    this.balances.set('BTC', 0.025);
  }
}

// Export singleton instance
export const walletPaymentService = WalletPaymentService.getInstance();

// Extend window interface for Freighter
declare global {
  interface Window {
    freighter?: {
      isConnected(): Promise<boolean>;
      getPublicKey(): Promise<string>;
      isAllowed(): Promise<boolean>;
      requestAccess(): Promise<void>;
      getNetwork(): Promise<string>;
      signTransaction(transaction: string): Promise<string>;
    };
  }
}