const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Global memory cache storing blacklisted tokens (logged out sessions)
const tokenBlacklist = new Set();

const blacklistToken = (token) => {
  if (token) {
    tokenBlacklist.add(token);
  }
};

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Check if token has been blacklisted (user clicked logout)
      if (tokenBlacklist.has(token)) {
        return res.status(401).json({ success: false, message: 'Session has been invalidated. Please login again.' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token and attach to request
      req.student = await Student.findById(decoded.id);

      if (!req.student) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect, blacklistToken };
