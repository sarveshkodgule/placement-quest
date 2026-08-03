const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Exclude password hash by default in queries
  },
  avatar: {
    type: String,
    default: '🧙'
  },
  rank: {
    type: String,
    default: 'Fresher'
  },
  xp: {
    type: Number,
    default: 0
  },
  coins: {
    type: Number,
    default: 200
  },
  streak: {
    type: Number,
    default: 1
  },
  classType: {
    type: String,
    default: ''
  },
  unlockedSkills: {
    type: [String],
    default: []
  },
  heistLevelsCompleted: {
    type: Number,
    default: 0
  },
  aptiHighScore: {
    type: Number,
    default: 0
  },
  collegeName: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  gradYear: {
    type: Number,
    default: null
  },
  rollNumber: {
    type: String,
    default: ''
  },
  clan: {
    type: String,
    default: ''
  },
  badges: {
    type: [String],
    default: []
  },
  activeTitle: {
    type: String,
    default: ''
  },
  lastDailyCompletedDate: {
    type: String,
    default: ''
  },
  resetPasswordOTP: {
    type: String,
    default: null
  },
  resetPasswordOTPExpires: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexing for rapid queries at high scale
StudentSchema.index({ xp: -1 }); // High-performance leaderboard sorting

// Encrypt password using bcrypt before saving
StudentSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
StudentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', StudentSchema);
