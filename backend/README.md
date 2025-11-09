# Stellar Strider Backend API

This is the backend API server for the Stellar Strider fitness tracking application. It provides database management for leaderboards, contest results, and payment history.

## Features

- **SQLite Database**: Lightweight, file-based database for easy deployment
- **RESTful API**: Clean API endpoints for frontend integration
- **Leaderboard System**: Global and contest-specific leaderboards
- **Contest Management**: Track contest participants, winners, and results
- **Payment History**: Record and track all prize distributions and payments
- **Prize Distribution**: Manage NFT rewards and XLM payouts

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `PORT`: Server port (default: 3001)
- `DB_PATH`: SQLite database file path
- `JWT_SECRET`: Secret key for JWT tokens
- `FRONTEND_URL`: Frontend URL for CORS

### 3. Initialize Database

```bash
npm run init-db
```

This will:
- Create the SQLite database
- Set up all tables and indexes
- Add sample data for testing

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Leaderboard
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/contest/:contestId` - Contest leaderboard
- `GET /api/leaderboard/user/:walletAddress/rank` - User rank
- `GET /api/leaderboard/top-performers` - Top performers by age category
- `GET /api/leaderboard/top-earners` - Top prize earners

### Contests
- `GET /api/contests` - All contests with filters
- `GET /api/contests/:id` - Contest details
- `GET /api/contests/:id/winners` - Contest winners
- `GET /api/contests/status/active` - Active contests
- `GET /api/contests/status/upcoming` - Upcoming contests
- `GET /api/contests/status/completed` - Completed contests
- `GET /api/contests/:id/payments` - Contest payment summary

### Payments
- `GET /api/payments` - All payments with filters
- `GET /api/payments/:id` - Payment details
- `GET /api/payments/wallet/:walletAddress` - User payment history
- `GET /api/payments/recent/all` - Recent payments
- `GET /api/payments/status/pending` - Pending payments
- `GET /api/payments/stats/volume` - Payment volume statistics
- `GET /api/payments/prizes/all` - Prize distributions
- `GET /api/payments/prizes/recent` - Recent prize distributions
- `GET /api/payments/prizes/pending` - Pending prize distributions
- `GET /api/payments/prizes/user/:walletAddress` - User prize history

## Database Schema

The database includes the following main tables:

- **users**: User profiles and statistics
- **contests**: Contest information and settings
- **contest_participants**: Contest participation records
- **activities**: Individual fitness activities
- **leaderboards**: Cached leaderboard data
- **prize_distributions**: Prize payout records
- **payment_history**: All payment transactions
- **nft_rewards**: NFT reward records
- **global_leaderboard**: Global ranking cache

## Sample Data

The initialization script adds sample data including:
- 5 sample users with different age categories
- 4 sample contests (completed, active, upcoming)
- Contest participation records
- Prize distributions
- Payment history

## Development

### Database Management

```bash
# Reinitialize database (WARNING: This will delete all data)
npm run init-db

# View database schema
sqlite3 database/stellar_strider.db ".schema"

# Query database
sqlite3 database/stellar_strider.db "SELECT * FROM users;"
```

### API Testing

You can test the API endpoints using curl or any HTTP client:

```bash
# Get global leaderboard
curl http://localhost:3001/api/leaderboard/global

# Get contest results
curl http://localhost:3001/api/contests/status/completed

# Get recent payments
curl http://localhost:3001/api/payments/recent/all
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure proper database path for persistent storage
3. Set up proper CORS origins
4. Use a process manager like PM2
5. Set up proper logging and monitoring

## Security Features

- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention through parameterized queries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details