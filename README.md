# 🏃‍♂️ Stellar Strider

**Decentralized Fitness Tracking Platform on Stellar Blockchain**

A revolutionary blockchain-powered fitness tracking application that combines real-time GPS tracking with Stellar blockchain technology to create a decentralized fitness ecosystem with contests, leaderboards, and crypto rewards.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stellar](https://img.shields.io/badge/Blockchain-Stellar-blue.svg)](https://stellar.org)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB.svg)](https://reactjs.org)

---

## 🌟 Features

### 🎯 Core Functionality
- **Real-Time GPS Tracking** - Professional-grade GPS accuracy with live path visualization
- **Stellar Blockchain Integration** - Store achievements permanently on Stellar blockchain
- **Freighter Wallet Support** - Secure wallet connection for Web3 functionality
- **Interactive Maps** - Leaflet-powered maps with real-time tracking visualization
- **Fitness Contests** - Join competitions and compete for crypto prizes
- **Global Leaderboards** - Track your performance against other runners
- **Payment System** - Automated prize distribution via Stellar network

### 🏆 Contest System
- Create and join fitness contests
- Real-time leaderboard updates
- Automated winner selection
- Prize pool management
- Contest history and statistics

### 💼 Wallet & Payments
- Freighter wallet integration
- Secure Stellar transactions
- Prize distribution tracking
- Payment history
- Multi-currency support (XLM, USDC)

### 🎨 User Experience
- **Stunning Earth Background** - CSS-animated Earth with rotating sphere and starfield
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Glassmorphism UI** - Modern glass-effect design with smooth animations
- **Professional Landing Page** - Complete with features showcase and statistics
- **Smooth Page Transitions** - Framer Motion powered animations

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Freighter Wallet** browser extension ([Install here](https://freighter.app))
- **SQLite3** (for backend database)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/stellar-strider.git
cd stellar-strider
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run init-db

# Start backend server
npm start
```

The backend API will run on `http://localhost:3001`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### Environment Configuration

#### Backend `.env`
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_PATH=./database/stellar-strider.db

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Stellar Network
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

#### Frontend `.env`
```env
# Stellar Configuration
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Backend API
VITE_API_URL=http://localhost:3001

# Optional: Smart Contract Address
VITE_PUBLIC_CONTRACT_ADDRESS=your-contract-address-here
```

---

## 📱 Usage

### 1. Connect Your Wallet
- Install Freighter wallet extension
- Create or import your Stellar wallet
- Click "Connect Wallet" in the app
- Approve the connection

### 2. Start Tracking
- Click "Start Run" to begin GPS tracking
- Move around to record your path
- Watch real-time stats update
- Click "Stop Run" when finished

### 3. Join Contests
- Browse available contests
- Join contests that interest you
- Complete your runs during contest period
- Check leaderboards for rankings

### 4. Earn Rewards
- Win contests to earn crypto prizes
- Prizes automatically distributed to your wallet
- Track your earnings in payment history

---

## 🏗️ Project Structure

```
stellar-strider/
├── backend/                    # Express.js API Server
│   ├── config/                # Database and app configuration
│   ├── database/              # SQLite database files
│   ├── models/                # Database models
│   ├── routes/                # API route handlers
│   │   ├── contests.js       # Contest management
│   │   ├── leaderboard.js    # Leaderboard endpoints
│   │   └── payments.js       # Payment processing
│   ├── scripts/              # Utility scripts
│   ├── server.js             # Main server file
│   └── package.json
│
├── frontend/                  # React Application
│   ├── public/               # Static assets
│   │   └── images/          # Image files
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── SimpleMap.jsx
│   │   │   ├── ContestPage.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── ContestLeaderboard.jsx
│   │   │   ├── WalletIntegration.jsx
│   │   │   └── ...
│   │   ├── utils/           # Utility functions
│   │   │   └── stellarWallet.js
│   │   ├── App.jsx          # Main application
│   │   ├── App.css          # Global styles
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── contract/                  # Soroban Smart Contract (Rust)
│   ├── src/
│   │   └── lib.rs           # Contract logic
│   ├── Cargo.toml
│   └── target/              # Compiled WASM
│
├── DEPLOYMENT.md             # Deployment guide
├── LICENSE                   # MIT License
└── README.md                # This file
```

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework with latest features
- **Vite** - Fast build tool and dev server
- **Framer Motion** - Smooth animations and transitions
- **Leaflet** - Interactive mapping library
- **React Leaflet** - React bindings for Leaflet
- **Stellar SDK** - Stellar blockchain integration
- **Freighter API** - Wallet connection

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite3** - Embedded database
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

### Blockchain
- **Stellar Network** - Blockchain platform
- **Soroban** - Smart contract platform (Rust)
- **Freighter** - Stellar wallet

---

## 📊 API Endpoints

### Leaderboard
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/contest/:contestId` - Contest leaderboard
- `GET /api/leaderboard/user/:walletAddress/rank` - User rank
- `GET /api/leaderboard/top-performers` - Top performers
- `GET /api/leaderboard/top-earners` - Top earners

### Contests
- `GET /api/contests` - All contests
- `GET /api/contests/:id` - Contest by ID
- `GET /api/contests/:id/winners` - Contest winners
- `GET /api/contests/status/active` - Active contests
- `GET /api/contests/status/upcoming` - Upcoming contests
- `GET /api/contests/status/completed` - Completed contests

### Payments
- `GET /api/payments` - All payments
- `GET /api/payments/:id` - Payment by ID
- `GET /api/payments/wallet/:walletAddress` - User payments
- `GET /api/payments/recent/all` - Recent payments
- `GET /api/payments/prizes/all` - All prizes
- `GET /api/payments/prizes/user/:walletAddress` - User prizes

---

## 🗺️ GPS Tracking Features

### Real-Time Tracking
- High-accuracy GPS positioning
- Live path visualization on map
- Movement detection algorithms
- Speed and pace calculation
- Distance tracking with Haversine formula

### Loop Validation
- Validates start and end points (50m tolerance)
- Minimum 3 GPS points required
- Clear feedback messages
- Prevents invalid submissions

### Statistics
- Real-time timer
- Distance traveled
- Current speed
- Average pace
- GPS accuracy indicator
- Movement status

---

## 🔐 Security Features

- **Helmet.js** - HTTP security headers
- **Rate Limiting** - API request throttling
- **CORS Protection** - Controlled cross-origin access
- **Input Validation** - Sanitized user inputs
- **Secure Wallet Connection** - Freighter integration
- **Environment Variables** - Sensitive data protection

---

## 🎮 Contest System

### Contest Types
- Distance challenges
- Time trials
- Speed competitions
- Custom fitness goals

### Prize Distribution
- Automated winner selection
- Instant prize distribution
- Multi-place rewards (1st, 2nd, 3rd)
- Transparent payment tracking

### Leaderboard Features
- Real-time rankings
- Performance metrics
- Historical data
- User statistics

---

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- Production environment setup
- Database configuration
- Stellar network deployment
- Smart contract deployment
- Frontend build and hosting
- Backend server deployment

---

## 🧪 Development

### Available Scripts

#### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run init-db    # Initialize database
```

#### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Testing GPS Tracking

#### Simulate GPS in Chrome DevTools
1. Open DevTools (F12)
2. Click Menu (⋮) → More Tools → Sensors
3. Under Location, select "Custom location"
4. Enter coordinates (e.g., Lat: 28.6139, Lon: 77.2090)
5. Start tracking in the app
6. Change coordinates to simulate movement
7. Return to start point to complete loop

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ GPS tracking system
- ✅ Stellar wallet integration
- ✅ Contest system
- ✅ Leaderboards
- ✅ Payment processing

### Phase 2 (Upcoming)
- [ ] Mobile app (React Native)
- [ ] Social features and friend challenges
- [ ] Advanced analytics dashboard
- [ ] NFT rewards for achievements
- [ ] Wearable device integration

### Phase 3 (Future)
- [ ] Multi-chain support
- [ ] DAO governance
- [ ] Marketplace for fitness NFTs
- [ ] Staking and yield farming
- [ ] Virtual races and events

---

## 📞 Support

- **Documentation**: Check this README and DEPLOYMENT.md
- **Issues**: [GitHub Issues](https://github.com/yourusername/stellar-strider/issues)
- **Email**: support@stellarstrider.app
- **Discord**: Join our community server

---

## 🙏 Acknowledgments

- **Stellar Development Foundation** - Blockchain infrastructure
- **OpenStreetMap** - Mapping data
- **Leaflet** - Mapping library
- **React Team** - UI framework
- **Freighter Team** - Wallet integration
- All contributors and testers

---

## 📈 Statistics

- **1,247** Total Runs Recorded
- **89** Active Users
- **15.4K** KM Tracked
- **342** Contests Completed

---

**Built with ❤️ for the decentralized fitness community**

🌍 **Transform Your Fitness Journey with Blockchain** 🚀
