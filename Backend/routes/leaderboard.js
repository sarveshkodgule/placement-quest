const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// @route   GET /api/leaderboard
// @desc    Get student ranks sorted by XP descending
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Purge corrupted Google URL test accounts from database
    await Student.deleteMany({ name: { $regex: '^https?://', $options: 'i' } });

    // Ensure MongoDB Atlas has a vibrant competitive candidate leaderboard
    const count = await Student.countDocuments();
    if (count < 5) {
      const defaultCandidates = [
        { name: 'CodeKing', email: 'codeking@quest.com', password: 'password123', avatar: '🏢', xp: 450, rank: 'Associate', rollNumber: '2310025' },
        { name: 'Undertaker', email: 'undertaker@quest.com', password: 'password123', avatar: '👾', xp: 320, rank: 'Associate', rollNumber: '2310041' },
        { name: 'Bandilki', email: 'bandilki@quest.com', password: 'password123', avatar: '🛡️', xp: 210, rank: 'Intern', rollNumber: 'anish' },
        { name: 'The Big Show', email: 'bigshow@quest.com', password: 'password123', avatar: '💪', xp: 180, rank: 'Intern', rollNumber: 'sarveshkodgule10' },
        { name: 'AnyaAmbani', email: 'anya@quest.com', password: 'password123', avatar: '🕶️', xp: 120, rank: 'Intern', rollNumber: 'anish2005' },
        { name: 'CodeAryan', email: 'aryan@quest.com', password: 'password123', avatar: '🛡️', xp: 90, rank: 'Fresher', rollNumber: '2303052' }
      ];

      for (const candidate of defaultCandidates) {
        const exists = await Student.findOne({ email: candidate.email });
        if (!exists) {
          await Student.create(candidate);
        }
      }
    }

    const ranks = await Student.find({})
      .select('name avatar rank xp classType email activeTitle')
      .sort({ xp: -1 })
      .limit(100);

    const cleanRanks = ranks.map(student => {
      const doc = student.toObject ? student.toObject() : student;
      return {
        ...doc,
        name: (doc.name && doc.name.startsWith('http')) ? 'SDE Candidate' : (doc.name || 'SDE Candidate'),
        avatar: (doc.avatar && doc.avatar.startsWith('http')) ? '🧙' : (doc.avatar || '🚀'),
        xp: typeof doc.xp === 'number' ? doc.xp : parseInt(doc.xp || 0, 10),
        activeTitle: doc.activeTitle || ''
      };
    });

    res.json({ success: true, leaderboard: cleanRanks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
