const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      let decoded;
      const primarySecret = process.env.JWT_SECRET || 'interviewace_secret';
      try {
        decoded = jwt.verify(token, primarySecret);
      } catch (err) {
        // Fallback: If JWT_SECRET was configured after token generation, check default secret
        if (primarySecret !== 'interviewace_secret') {
          try {
            decoded = jwt.verify(token, 'interviewace_secret');
          } catch (fallbackErr) {
            throw err;
          }
        } else {
          throw err;
        }
      }

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
