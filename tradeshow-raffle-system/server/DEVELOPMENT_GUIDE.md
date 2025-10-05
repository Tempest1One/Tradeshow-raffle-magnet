# Tradeshow Raffle System - Development Guide

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string
```

### 2. Database Operations

#### Seed Database (Initial Setup)
```bash
# Seed the database with prize tiers and initial data
npm run seed
```

#### Cleanup Operations
```bash
# Remove all data including prize structure
npm run cleanup:all

# Remove only test data, keep prize structure
npm run cleanup:test

# Show database statistics
npm run cleanup:stats
```

#### Development Server
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Database Schema

### Collections:
- **emailEntries**: User email submissions
- **prizes**: Individual prize items
- **prizeTiers**: Prize tier configuration (5 tiers)
- **sessions**: Raffle sessions

### Prize Distribution:
- **Tier 1**: 1 Grand Prize (1% chance)
- **Tier 2**: 10 Premium Prizes (5% chance)
- **Tier 3**: 50 High-Value Prizes (15% chance)
- **Tier 4**: 100 Standard Prizes (30% chance)
- **Tier 5**: 189 Consolation Prizes (49% chance)
- **Total**: 350 prizes

## 🔧 API Endpoints

### REST API
- `GET /health` - Health check
- `POST /api/emails` - Submit email entry
- `GET /api/emails/stats` - Get email statistics

### WebSocket Events
- `register-client` - Register iPad/TV client
- `submit-email` - Submit email entry
- `start-raffle` - Start raffle process
- `select-prize` - Select random prize
- `get-session-info` - Get session statistics

## 🧪 Testing Workflow

### 1. Initial Setup
```bash
# Clean database
npm run cleanup:all

# Seed with fresh data
npm run seed

# Start server
npm run dev
```

### 2. Test Email Submission
```bash
# Test REST API
curl -X POST http://localhost:3001/api/emails \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","sessionId":"test-session"}'

# Check stats
curl http://localhost:3001/api/emails/stats
```

### 3. Test WebSocket Connection
```javascript
// Connect to WebSocket
const socket = io('http://localhost:3001');

// Register as iPad client
socket.emit('register-client', { clientType: 'ipad' });

// Submit email
socket.emit('submit-email', {
  email: 'test@example.com',
  ipAddress: '127.0.0.1',
  userAgent: 'Test Client'
});

// Start raffle
socket.emit('start-raffle');

// Select prize
socket.emit('select-prize');
```

### 4. Cleanup After Testing
```bash
# Remove test data but keep prize structure
npm run cleanup:test

# Or remove everything
npm run cleanup:all
```

## 🐛 Debugging

### Common Issues

1. **MongoDB Connection Failed**
   - Check MONGODB_URI in .env file
   - Ensure MongoDB is running
   - Check network connectivity

2. **WebSocket Connection Failed**
   - Check CORS settings in app.ts
   - Verify client URL matches CLIENT_URL env var
   - Check firewall settings

3. **Prize Selection Errors**
   - Ensure database is seeded
   - Check prize quantities are > 0
   - Verify prize tiers are active

### Logs
- Server logs show connection status
- Database operations are logged
- WebSocket events are tracked
- Prize selection results are logged

## 📈 Monitoring

### Database Stats
```bash
# Check current database state
npm run cleanup:stats
```

### Key Metrics
- Total email entries
- Prizes remaining by tier
- Active sessions
- Connection status

## 🔄 Development Cycle

1. **Start Development**
   ```bash
   npm run dev
   ```

2. **Test Features**
   - Use WebSocket client to test real-time features
   - Use REST API for admin functions
   - Monitor logs for errors

3. **Cleanup**
   ```bash
   npm run cleanup:test
   ```

4. **Repeat**

## 🚨 Production Considerations

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 3001)
- `CLIENT_URL`: Allowed client origins for CORS

### Security
- Email validation is implemented
- Rate limiting should be added for production
- HTTPS should be used in production

### Performance
- Database indexes are optimized
- WebSocket connections are managed
- Prize selection is atomic

## 📝 Notes

- All database operations are atomic
- Prize quantities are automatically decremented
- Session management is automatic
- Error handling is comprehensive
- Logging is detailed for debugging

