const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running' });
});

app.get('/db-test', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Database connection failed',
        error: err.message
      });
    }

    res.json({
      message: 'Database connection successful',
      data: results
    });
  });
});

app.get('/portfolio-projects', (req, res) => {
  db.query('SELECT * FROM portfolio_projects', (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Error fetching portfolio projects',
        error: err.message
      });
    }

    res.json(results);
  });
});

app.get('/portfolio-projects/:slug', (req, res) => {
  const { slug } = req.params;

  db.query(
    'SELECT * FROM portfolio_projects WHERE slug = ? LIMIT 1',
    [slug],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Error fetching portfolio project',
          error: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: 'Portfolio project not found'
        });
      }

      res.json(results[0]);
    }
  );
});

app.get('/premium-content', (req, res) => {
  db.query(
    'SELECT * FROM premium_content WHERE published = 1 ORDER BY display_order ASC',
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Error fetching premium content',
          error: err.message
        });
      }

      res.json(results);
    }
  );
});

app.get('/premium-content/:slug', (req, res) => {
  const { slug } = req.params;

  db.query(
    'SELECT * FROM premium_content WHERE slug = ? AND published = 1 LIMIT 1',
    [slug],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Error fetching premium content',
          error: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: 'Premium content not found'
        });
      }

      res.json(results[0]);
    }
  );
});

app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Name, email and password are required'
    });
  }

  try {
    db.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email],
      async (checkErr, checkResults) => {
        if (checkErr) {
          return res.status(500).json({
            message: 'Error checking existing user',
            error: checkErr.message
          });
        }

        if (checkResults.length > 0) {
          return res.status(409).json({
            message: 'Email already registered'
          });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        db.query(
          'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
          [name, email, passwordHash, 'subscriber'],
          (insertErr, insertResults) => {
            if (insertErr) {
              return res.status(500).json({
                message: 'Error registering user',
                error: insertErr.message
              });
            }

            res.status(201).json({
              message: 'User registered successfully',
              user: {
                id: insertResults.insertId,
                name,
                email,
                role: 'subscriber'
              }
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({
      message: 'Unexpected server error',
      error: error.message
    });
  }
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    });
  }

  db.query(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Error logging in',
          error: err.message
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      const user = results[0];

      try {
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
          return res.status(401).json({
            message: 'Invalid email or password'
          });
        }

        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role
          },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      } catch (compareError) {
        res.status(500).json({
          message: 'Error verifying password',
          error: compareError.message
        });
      }
    }
  );
});

app.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'Protected profile data',
    user: req.user
  });
});

app.get('/my-subscription', authMiddleware, (req, res) => {
  db.query(
    'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY start_date DESC LIMIT 1',
    [req.user.id],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Error fetching subscription',
          error: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: 'Subscription not found'
        });
      }

      res.json(results[0]);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});