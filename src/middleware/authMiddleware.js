const jwt = require('jsonwebtoken');
const db = require('../config/db');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

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

function requireActiveSubscription(req, res, next) {
  db.query(
    `
    SELECT *
    FROM subscriptions
    WHERE user_id = ?
      AND status = 'active'
      AND (end_date IS NULL OR end_date >= CURDATE())
    ORDER BY id DESC
    LIMIT 1
    `,
    [req.user.id],
    (err, results) => {
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
    }
  );
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required'
    });
  }

  next();
}

module.exports = {
  authMiddleware,
  requireActiveSubscription,
  requireAdmin
};