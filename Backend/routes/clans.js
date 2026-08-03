const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// @route   GET /api/clans/standings
// @desc    Get collective clan standings sorted by sum of members' XP
// @access  Public
router.get('/standings', async (req, res) => {
  try {
    const results = await Student.aggregate([
      { $match: { clan: { $ne: '' } } },
      { $group: { _id: "$clan", totalXp: { $sum: "$xp" }, memberCount: { $sum: 1 } } }
    ]);
    
    const defaultClans = [
      { id: 'algo_overlords', name: 'Algorithm Overlords', emoji: '⚔️', totalXp: 0, memberCount: 0 },
      { id: 'bytecode_buccaneers', name: 'Bytecode Buccaneers', emoji: '🏴‍☠️', totalXp: 0, memberCount: 0 },
      { id: 'recursion_rangers', name: 'Recursion Rangers', emoji: '🌀', totalXp: 0, memberCount: 0 }
    ];

    const standings = defaultClans.map(clan => {
      const dbClan = results.find(r => r._id === clan.id);
      if (dbClan) {
        return {
          ...clan,
          totalXp: dbClan.totalXp,
          memberCount: dbClan.memberCount
        };
      }
      return clan;
    });

    // Sort descending by collective XP
    standings.sort((a, b) => b.totalXp - a.totalXp);

    res.json({ success: true, standings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/clans/:clanId/members
// @desc    Get all students registered in a specific clan sorted by XP
// @access  Public
router.get('/:clanId/members', async (req, res) => {
  try {
    const { clanId } = req.params;
    const members = await Student.find({ clan: clanId })
      .select('name avatar rank xp email')
      .sort({ xp: -1 })
      .limit(100);

    const cleanMembers = members.map(student => {
      const doc = student.toObject ? student.toObject() : student;
      return {
        name: (doc.name && doc.name.startsWith('http')) ? 'SDE Candidate' : (doc.name || 'SDE Candidate'),
        avatar: (doc.avatar && doc.avatar.startsWith('http')) ? '🧙' : (doc.avatar || '🚀'),
        rank: doc.rank || 'Fresher',
        xp: typeof doc.xp === 'number' ? doc.xp : parseInt(doc.xp || 0, 10),
        email: doc.email
      };
    });

    res.json({ success: true, members: cleanMembers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
