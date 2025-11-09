// Blockchain Configuration Test
import { ethers } from 'ethers';

// Test environment variables
export const testBlockchainConfig = () => {
    console.log('🔧 Testing Blockchain Configuration...');

    const infuraKey = import.meta.env.VITE_PUBLIC_INFURA_API_KEY;
    const contractAddress = import.meta.env.VITE_PUBLIC_CONTRACT_ADDRESS;
    const networkId = import.meta.env.VITE_PUBLIC_NETWORK_ID || '1';

    console.log('📋 Environment Variables:');
    console.log('- Infura API Key:', infuraKey ? '✅ Configured' : '❌ Missing');
    console.log('- Contract Address:', contractAddress ? '✅ Configured' : '❌ Missing');
    console.log('- Network ID:', networkId);

    if (!infuraKey) {
        console.warn('⚠️ VITE_PUBLIC_INFURA_API_KEY is not set in .env file');
        return false;
    }

    if (!contractAddress || contractAddress === '0x...Your...Deployed...Address...') {
        console.warn('⚠️ VITE_PUBLIC_CONTRACT_ADDRESS is not properly configured');
    }

    return true;
};

// Test Infura connection
export const testInfuraConnection = async () => {
    try {
        const infuraKey = import.meta.env.VITE_PUBLIC_INFURA_API_KEY;
        const networkId = import.meta.env.VITE_PUBLIC_NETWORK_ID || '1';

        if (!infuraKey) {
            throw new Error('Infura API key not configured');
        }

        const networkName = networkId === '1' ? 'mainnet' :
            networkId === '11155111' ? 'sepolia' :
                networkId === '137' ? 'polygon' : 'mainnet';

        const provider = new ethers.JsonRpcProvider(`https://${networkName}.infura.io/v3/${infuraKey}`);

        console.log('🔄 Testing Infura connection...');
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();

        console.log('✅ Infura connection successful!');
        console.log('- Network:', network.name);
        console.log('- Chain ID:', network.chainId.toString());
        console.log('- Latest Block:', blockNumber);

        return { success: true, network, blockNumber };
    } catch (error) {
        console.error('❌ Infura connection failed:', error.message);
        return { success: false, error: error.message };
    }
};

// Test MetaMask connection
export const testMetaMaskConnection = async () => {
    try {
        if (!window.ethereum) {
            throw new Error('MetaMask not installed');
        }

        console.log('🔄 Testing MetaMask connection...');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();

        console.log('✅ MetaMask connection successful!');
        console.log('- Network:', network.name);
        console.log('- Chain ID:', network.chainId.toString());

        return { success: true, network };
    } catch (error) {
        console.error('❌ MetaMask connection failed:', error.message);
        return { success: false, error: error.message };
    }
};

// Run all tests
export const runBlockchainTests = async () => {
    console.log('🚀 Running Blockchain Tests...');
    console.log('================================');

    // Test 1: Configuration
    const configTest = testBlockchainConfig();

    // Test 2: Infura Connection
    if (configTest) {
        await testInfuraConnection();
    }

    // Test 3: MetaMask Connection
    await testMetaMaskConnection();

    console.log('================================');
    console.log('✅ Blockchain tests completed!');
};