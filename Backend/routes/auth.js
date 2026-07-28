const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new SDE student
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, avatar, collegeName, department, gradYear, rollNumber } = req.body;

    const studentExists = await Student.findOne({ email });
    if (studentExists) {
      return res.status(400).json({ success: false, message: 'Student already exists' });
    }

    const student = await Student.create({
      name,
      email,
      password,
      avatar: avatar || '🧙',
      collegeName: collegeName || '',
      department: department || '',
      gradYear: gradYear || null,
      rollNumber: rollNumber || ''
    });

    if (student) {
      res.status(201).json({
        success: true,
        token: generateToken(student._id),
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          avatar: student.avatar,
          rank: student.rank,
          xp: student.xp,
          coins: student.coins,
          streak: student.streak,
          classType: student.classType,
          unlockedSkills: student.unlockedSkills,
          heistLevelsCompleted: student.heistLevelsCompleted,
          aptiHighScore: student.aptiHighScore,
          collegeName: student.collegeName,
          department: student.department,
          gradYear: student.gradYear,
          rollNumber: student.rollNumber
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid student registration data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate student & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email }).select('+password');
    if (student && (await student.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(student._id),
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          avatar: student.avatar,
          rank: student.rank,
          xp: student.xp,
          coins: student.coins,
          streak: student.streak,
          classType: student.classType,
          unlockedSkills: student.unlockedSkills,
          heistLevelsCompleted: student.heistLevelsCompleted,
          aptiHighScore: student.aptiHighScore,
          collegeName: student.collegeName,
          department: student.department,
          gradYear: student.gradYear,
          rollNumber: student.rollNumber
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in student profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, error: error.message });
  }
});

// @route   PUT /api/auth/progress
// @desc    Update student XP, Coins, unlocked skills list, and classType
// @access  Private
router.put('/progress', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);

    if (student) {
      // Safely update parameters if sent in body
      if (req.body.xp !== undefined) student.xp = Number(req.body.xp);
      if (req.body.coins !== undefined) student.coins = Number(req.body.coins);
      if (req.body.streak !== undefined) student.streak = Number(req.body.streak);
      if (req.body.classType !== undefined) student.classType = req.body.classType;
      if (req.body.unlockedSkills !== undefined) student.unlockedSkills = req.body.unlockedSkills;
      if (req.body.heistLevelsCompleted !== undefined) student.heistLevelsCompleted = Number(req.body.heistLevelsCompleted);
      if (req.body.aptiHighScore !== undefined) student.aptiHighScore = Number(req.body.aptiHighScore);
      if (req.body.clan !== undefined) student.clan = req.body.clan;

      // Dynamically rank up based on XP
      if (student.xp >= 12000) {
        student.rank = 'CTO Legend';
      } else if (student.xp >= 6000) {
        student.rank = 'Architect';
      } else if (student.xp >= 3000) {
        student.rank = 'Tech Lead';
      } else if (student.xp >= 1500) {
        student.rank = 'Senior Engineer';
      } else if (student.xp >= 700) {
        student.rank = 'Engineer';
      } else if (student.xp >= 300) {
        student.rank = 'Associate';
      } else if (student.xp >= 100) {
        student.rank = 'Intern';
      } else {
        student.rank = 'Fresher';
      }

      const updatedStudent = await student.save();
      res.json({ success: true, student: updatedStudent });
    } else {
      res.status(404).json({ success: false, message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/auth/claim-daily-reward
// @desc    Claim 7-day streak daily reward
// @access  Private
router.post('/claim-daily-reward', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const { rewardCoins, rewardXP } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    if (student.lastDailyCompletedDate === todayStr) {
      return res.status(400).json({ success: false, message: "Today's daily login reward has already been claimed!" });
    }

    student.coins += (rewardCoins || 50);
    student.xp += (rewardXP || 20);
    student.streak += 1;
    student.lastDailyCompletedDate = todayStr;

    await student.save();

    res.json({
      success: true,
      message: 'Daily reward claimed successfully!',
      coins: student.coins,
      xp: student.xp,
      streak: student.streak,
      lastDailyCompletedDate: student.lastDailyCompletedDate
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Reset password using Student ID / Roll Number & Email OTP Verification
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, rollNumber, code, newPassword } = req.body;

    const student = await Student.findOne({ email }).select('+password');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student email not found' });
    }

    if (!student.rollNumber || student.rollNumber.trim().toLowerCase() !== rollNumber.trim().toLowerCase()) {
      return res.status(400).json({ success: false, message: 'Invalid Roll Number / Student ID verification' });
    }

    // Step 1: Request Code (if no code parameter is provided)
    if (!code) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      student.resetPasswordOTP = otp;
      student.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
      await student.save();

      // Send the code via email
      try {
        const sendEmail = require('../utils/sendEmail');
        await sendEmail({
          email: student.email,
          subject: '🎮 Placement Quest - Password Reset Verification Code',
          otp
        });
      } catch (err) {
        console.error('Error sending email:', err);
      }

      return res.json({ 
        success: true, 
        otpSent: true, 
        message: `Verification code sent to your email! (Local Sim Code also logged on console)` 
      });
    }

    // Step 2: Validate OTP Code and Reset Password
    if (!student.resetPasswordOTP || student.resetPasswordOTP !== code) {
      return res.status(400).json({ success: false, message: 'Invalid or incorrect verification OTP code' });
    }

    if (student.resetPasswordOTPExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Verification OTP code has expired' });
    }

    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'New password is required to complete reset' });
    }

    student.password = newPassword;
    student.resetPasswordOTP = null;
    student.resetPasswordOTPExpires = null;
    await student.save();

    res.json({ success: true, message: 'Password reset successful!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/verify-id
// @desc    Verify Student Roll Number / ID to complete login
// @access  Public
router.post('/verify-id', async (req, res) => {
  try {
    const { email, rollNumber } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!student.rollNumber || student.rollNumber.trim().toLowerCase() !== rollNumber.trim().toLowerCase()) {
      return res.status(400).json({ success: false, message: 'Student ID / Roll Number verification failed' });
    }

    res.json({
      success: true,
      token: generateToken(student._id),
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        rank: student.rank,
        xp: student.xp,
        coins: student.coins,
        streak: student.streak,
        classType: student.classType,
        unlockedSkills: student.unlockedSkills,
        heistLevelsCompleted: student.heistLevelsCompleted,
        aptiHighScore: student.aptiHighScore,
        collegeName: student.collegeName,
        department: student.department,
        gradYear: student.gradYear,
        rollNumber: student.rollNumber
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
