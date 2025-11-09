# 🚀 Deployment Guide - Stellar Strider

## 📋 Pre-Deployment Checklist

- [x] Smart contract compiled to WASM
- [x] Frontend built and tested locally
- [ ] Freighter wallet installed
- [ ] Stellar CLI configured
- [ ] Contract deployed to Futurenet

## 🔧 Step-by-Step Deployment

### 1. Install Freighter Wallet

1. Go to Chrome Web Store or Firefox Add-ons
2. Search for "Freighter Wallet"
3. Install the extension
4. Create a new wallet or import existing
5. **Important**: Switch network to "Futurenet" in settings

### 2. Setup Stellar CLI (If Not Done)

```bash
# Windows (PowerShell)
winget install --id Stellar.StellarCLI

# Or via Cargo
cargo install --locked stellar-cli
```

Restart your terminal after installation.

### 3. Create Stellar Identity

```bash
# Generate new identity
stellar keys generate strider-user --network futurenet

# This creates a keypair and stores it locally
# You'll see: "Public key: G..."
```

### 4. Fund Your Account (Testnet)

```bash
# Get the public key
stellar keys address strider-user

# Visit Stellar Laboratory: https://laboratory.stellar.org/#account-creator?network=futurenet
# Or use Friendbot (if available):
curl "https://friendbot-futurenet.stellar.org/?addr=YOUR_PUBLIC_KEY"
```

### 5. Deploy Smart Contract

```bash
cd contract

# Build optimized WASM
cargo build --target wasm32-unknown-unknown --release

# Deploy to Futurenet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/contract.wasm \
  --source strider-user \
  --network futurenet

# Output: Contract ID (e.g., CBXXXXXXX...)
# SAVE THIS CONTRACT ID!
```

### 6. Install Contract (Create Contract Instance)

```bash
stellar contract install \
  --wasm target/wasm32-unknown-unknown/release/contract.wasm \
  --source strider-user \
  --network futurenet

# Output: WASM Hash
```

### 7. Update Frontend with Contract ID

Edit `frontend/src/config.js` (create this file):

```javascript
export const CONTRACT_ID = 'YOUR_CONTRACT_ID_HERE';
export const NETWORK = 'FUTURENET';
export const NETWORK_PASSPHRASE = 'Test SDF Future Network ; October 2022';
export const RPC_URL = 'https://rpc-futurenet.stellar.org';
```

### 8. Update App.jsx to Use Contract

Add this to `frontend/src/App.jsx` (in the submitToBlockchain function):

```javascript
import * as StellarSdk from 'stellar-sdk';
import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from './config';

const submitToBlockchain = async () => {
  if (!walletAddress) {
    setMessage('Please connect wallet first');
    return;
  }

  try {
    const server = new StellarSdk.SorobanRpc.Server(RPC_URL);
    
    // Load account
    const account = await server.getAccount(walletAddress);
    
    // Build contract invocation
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    
    const loopId = `loop_${path[0][0].toFixed(4)}_${path[0][1].toFixed(4)}`;
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(
        'submit_time',
        StellarSdk.Address.fromString(walletAddress),
        StellarSdk.nativeToScVal(loopId, { type: 'string' }),
        StellarSdk.nativeToScVal(elapsedTime, { type: 'u64' })
      ))
      .setTimeout(30)
      .build();
    
    // Prepare transaction
    const prepared = await server.prepareTransaction(transaction);
    
    // Sign with Freighter
    const { signedTxXdr } = await signTransaction(prepared.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    
    // Submit
    const tx = StellarSdk.TransactionBuilder.fromXDR(
      signedTxXdr,
      NETWORK_PASSPHRASE
    );
    
    const result = await server.sendTransaction(tx);
    
    setMessage(`Success! Transaction: ${result.hash}`);
    
  } catch (error) {
    setMessage('Error: ' + error.message);
  }
};
```

### 9. Build Frontend for Production

```bash
cd frontend

# Build optimized production bundle
npm run build

# Output will be in 'dist/' folder
```

### 10. Deploy Frontend

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Follow prompts, connect GitHub if needed
```

#### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod --dir=dist
```

#### Option C: GitHub Pages

```bash
# Add to package.json:
# "homepage": "https://yourusername.github.io/stellar-strider"

# Build with base path
npm run build -- --base=/stellar-strider/

# Push dist folder to gh-pages branch
```

## 🧪 Testing the Deployed App

### 1. Test Wallet Connection

- Open deployed app
- Click "Connect Wallet"
- Approve in Freighter
- Verify wallet address shows

### 2. Test GPS Tracking

- Click "Start Run"
- Allow location permission
- Walk around (or use browser dev tools to mock location)
- Click "Stop Run"
- Verify time and distance calculated

### 3. Test Loop Validation

- Ensure you return close to starting point
- Should see "Valid loop!" message
- If not close enough: "Invalid loop!" message

### 4. Test Blockchain Submission

- With valid loop, click "Submit to Blockchain"
- Freighter popup appears
- Approve transaction
- Wait for confirmation
- Check transaction on Stellar Expert:
  https://stellar.expert/explorer/futurenet/tx/TRANSACTION_HASH

## 🔍 Debugging Common Issues

### Issue: "Contract not found"
**Solution**: Verify CONTRACT_ID is correct and contract is deployed

### Issue: "Network error"
**Solution**: Check you're on Futurenet in both app and Freighter

### Issue: "Insufficient balance"
**Solution**: Fund your Freighter account using Friendbot

### Issue: "GPS not working"
**Solution**: 
- Ensure HTTPS (or localhost)
- Grant location permissions
- Check browser console for errors

### Issue: "Transaction failed"
**Solution**:
- Check account has XLM for fees
- Verify contract function signature matches
- Look at transaction details in Stellar Expert

## 📊 Monitoring & Analytics

### View Contract Activity

```bash
# Get contract events
stellar contract invoke \
  --id CONTRACT_ID \
  --source strider-user \
  --network futurenet \
  -- get_record \
  --loop_id "loop_28.6139_77.2090"
```

### View on Stellar Expert

- Futurenet Explorer: https://stellar.expert/explorer/futurenet
- Search by:
  - Contract ID
  - Transaction hash
  - Wallet address

## 🎬 Demo Script for Hackathon

1. **Show the concept** (30 sec)
   - "Decentralized GPS racing on Stellar"
   - "Compete for fastest loop times"

2. **Demo the flow** (2 min)
   - Connect wallet
   - Start tracking
   - Complete loop
   - Submit to blockchain
   - Show transaction on explorer

3. **Highlight tech** (1 min)
   - Rust smart contract
   - Real-time GPS
   - Soroban integration

4. **Future vision** (30 sec)
   - NFTs for champions
   - Prize pools
   - Social features

## 🎉 Post-Deployment

- [ ] Test all features end-to-end
- [ ] Share demo link with team
- [ ] Prepare presentation slides
- [ ] Create demo video
- [ ] Update README with live URLs
- [ ] Submit to hackathon portal

## 🆘 Support

If you run into issues:
1. Check Stellar Discord: https://discord.gg/stellar
2. Review Soroban docs: https://soroban.stellar.org
3. Post on Stellar Stack Exchange

---

**Good luck with your submission!** 🌟
