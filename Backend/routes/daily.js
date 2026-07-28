const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

const GAMES = [
  { id: 'algo-arena', name: 'Dsa Arena', desc: 'Defeat a data structures boss inside the Algorithm Arena!' },
  { id: 'sql-heist', name: 'Data Bank', desc: 'Crack a database breach chamber lock inside the SQL Heist!' },
  { id: 'code-inspector', name: 'Code Decryptor', desc: 'Exterminate a corrupt programming bug inside the Code Decryptor!' },
  { id: 'apti-rush', name: 'Aptitude District', desc: 'Survive Aptitude Rush and score a correct combo multiplier!' },
  { id: 'resume-tycoon', name: 'Resume Builder Tycoon', desc: 'Deploy an engineering project inside Resume Builder Tycoon!' }
];

// @route   GET /api/daily-challenge
// @desc    Get the daily rotated featured game challenge details
// @access  Public (Optional auth)
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Deterministic date math rotation
    let hashSum = 0;
    for (let i = 0; i < today.length; i++) {
      hashSum += today.charCodeAt(i);
    }
    const gameIdx = hashSum % GAMES.length;
    const featuredGame = GAMES[gameIdx];

    let completed = false;
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const student = await Student.findById(decoded.id);
        if (student && student.lastDailyCompletedDate === today) {
          completed = true;
        }
      } catch (err) {
        // Silently fallback if token invalid or expired
      }
    }

    res.json({
      success: true,
      date: today,
      game: featuredGame,
      coinsReward: 50,
      xpReward: 30,
      completed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/daily-challenge/complete
// @desc    Complete the daily challenge, claim SDE coins and XP
// @access  Private
router.post('/complete', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const student = await Student.findById(req.student.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (student.lastDailyCompletedDate === today) {
      return res.status(400).json({ success: false, message: 'Daily challenge already completed today!' });
    }

    // Award daily modifier rewards
    student.coins += 50;
    student.lastDailyCompletedDate = today;
    
    // Award XP and evaluate potential rank elevation
    const addedXp = 30;
    student.xp += addedXp;

    // Evaluate ranks dynamically
    const RANKS = [
      { name: 'Fresher', xpNeeded: 0 },
      { name: 'Intern', xpNeeded: 100 },
      { name: 'Associate', xpNeeded: 300 },
      { name: 'Engineer', xpNeeded: 700 },
      { name: 'Senior Engineer', xpNeeded: 1500 },
      { name: 'Tech Lead', xpNeeded: 3000 },
      { name: 'Architect', xpNeeded: 6000 },
      { name: 'CTO Legend', xpNeeded: 12000 }
    ];
    let currentRank = 'Fresher';
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (student.xp >= RANKS[i].xpNeeded) {
        currentRank = RANKS[i].name;
        break;
      }
    }
    student.rank = currentRank;

    await student.save();

    res.json({
      success: true,
      message: 'Daily challenge rewards claimed!',
      coins: student.coins,
      xp: student.xp,
      rank: student.rank,
      lastDailyCompletedDate: student.lastDailyCompletedDate
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
