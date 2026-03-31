const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Access denied. No token provided'
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      message: 'Invalid token format'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
}

module.exports = {
  authMiddleware,
  requireActiveSubscription
};

function requireActiveSubscription(req, res, next) {
  const userId = req.user.id;

  const query = `
    SELECT * FROM subscriptions
    WHERE user_id = ?
      AND status = 'active'
      AND end_date >= CURDATE()
    ORDER BY end_date DESC
    LIMIT 1
  `;

  const db = require('../config/db');

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Error checking subscription',
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(403).json({
        message: 'Active subscription required'
      });
    }

    req.subscription = results[0];
    next();
  });
}