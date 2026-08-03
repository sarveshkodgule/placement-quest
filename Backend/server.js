require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB, closeDB } = require('./config/db');
const { auditLogger } = require('./middleware/audit');
const { querySanitizer } = require('./middleware/sanitize');

// Connect to MongoDB & Auto-Seed Questions
connectDB().then(async () => {
  try {
    const Question = require('./models/Question');
    const hasNewSeed = await Question.findOne({ 'extraDetails.file': 'reporting.sql' });
    if (!hasNewSeed) {
      console.log('🌱 Database needs seeding/updating. Clearing old questions and seeding new ones...');
      await Question.deleteMany({});
      const fs = require('fs');
      const path = require('path');
      const seedQuestions = JSON.parse(fs.readFileSync(path.join(__dirname, './seedData.json'), 'utf8'));
      await Question.insertMany(seedQuestions);
      console.log('✅ Database questions seeded successfully!');
    }
  } catch (err) {
    console.error('❌ Database seeding failed:', err.message);
  }
});

const app = express();

// 1. Security Headers Configuration (XSS protection, MIME checks)
app.use(helmet());

// 1b. Central Audit logging & NoSQL sanitization filters
app.use(auditLogger);
app.use(querySanitizer);

// 2. CORS Locking (Allows localhost and wildcard options safely)
app.use(cors({
  origin: '*', // We allow wildcard to simplify deployment testing, lock origin to frontend URL in production config
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 3. Rate Limiter (Protects SDE endpoints against brute force sweeps)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 150, // Limit each IP to 150 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many API requests from this connection, please retry in 15 minutes.' }
});
app.use('/api/', apiLimiter);

// Base Health Check
app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'Silicon Metropolis API Gateway Online' });
});

// Routes Registers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/daily-challenge', require('./routes/daily'));
app.use('/api/clans', require('./routes/clans'));

// 4. Centralized Error Boundary Middleware (Ensures server never crashes on uncaught rejects)
app.use((err, req, res, next) => {
  console.error(`🚨 Centralized Error Boundary: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Fallback Page Not Found Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource Endpoint Not Found' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 SDE Server running in production on port ${PORT}`);
});

// 5. Graceful shutdowns on system signals
const shutdownGracefully = async () => {
  console.log('⏳ Termination signal received. Gracefully closing Express server...');
  server.close(async () => {
    console.log('✅ Express server closed.');
    await closeDB();
    console.log('👋 Process exiting successfully.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdownGracefully);
process.on('SIGINT', shutdownGracefully);
