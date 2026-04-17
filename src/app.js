const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  authMiddleware,
  requireActiveSubscription,
  requireAdmin
} = require('./middleware/authMiddleware');

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

app.get('/premium-content', authMiddleware, requireActiveSubscription, (req, res) => {
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

app.get('/admin/premium-content', authMiddleware, requireAdmin, (req, res) => {
  db.query(
    'SELECT * FROM premium_content ORDER BY display_order ASC, id DESC',
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Error fetching admin premium content',
          error: err.message
        });
      }

      res.json(results);
    }
  );
});

app.get('/admin/premium-content/:id', authMiddleware, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.query(
    'SELECT * FROM premium_content WHERE id = ? LIMIT 1',
    [id],
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

app.get('/premium-content/:slug', authMiddleware, requireActiveSubscription, (req, res) => {
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

app.post('/premium-content', authMiddleware, requireAdmin, (req, res) => {
  const {
    title,
    slug,
    description,
    support_text,
    video_url,
    cover_image,
    topic,
    display_order,
    published
  } = req.body;

  if (!title || !slug || !video_url) {
    return res.status(400).json({
      message: 'Title, slug and video_url are required'
    });
  }

  db.query(
    `
    INSERT INTO premium_content (
      title,
      slug,
      description,
      support_text,
      video_url,
      cover_image,
      topic,
      display_order,
      published
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      title,
      slug,
      description || null,
      support_text || null,
      video_url,
      cover_image || null,
      topic || null,
      display_order || 0,
      published ? 1 : 0
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Error creating premium content',
          error: err.message
        });
      }

      res.status(201).json({
        message: 'Premium content created successfully',
        id: result.insertId
      });
    }
  );
});

app.put('/premium-content/:id', authMiddleware, requireAdmin, (req, res) => {
  const { id } = req.params;

  const {
    title,
    slug,
    description,
    support_text,
    video_url,
    cover_image,
    topic,
    display_order,
    published
  } = req.body;

  if (!title || !slug || !video_url) {
    return res.status(400).json({
      message: 'Title, slug and video_url are required'
    });
  }

  db.query(
    `
    UPDATE premium_content
    SET
      title = ?,
      slug = ?,
      description = ?,
      support_text = ?,
      video_url = ?,
      cover_image = ?,
      topic = ?,
      display_order = ?,
      published = ?
    WHERE id = ?
    `,
    [
      title,
      slug,
      description || null,
      support_text || null,
      video_url,
      cover_image || null,
      topic || null,
      display_order || 0,
      published ? 1 : 0,
      id
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Error updating premium content',
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: 'Premium content not found'
        });
      }

      res.json({
        message: 'Premium content updated successfully'
      });
    }
  );
});

app.delete('/premium-content/:id', authMiddleware, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM premium_content WHERE id = ?',
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Error deleting premium content',
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: 'Premium content not found'
        });
      }

      res.json({
        message: 'Premium content deleted successfully'
      });
    }
  );
});

app.post('/subscribe', async (req, res) => {
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
          (userErr, userResult) => {
            if (userErr) {
              return res.status(500).json({
                message: 'Error creating user',
                error: userErr.message
              });
            }

            const userId = userResult.insertId;

            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);

            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];

            const simulatedProviderSubscriptionId = `sub_sim_${userId}_${Date.now()}`;
            const simulatedProviderPaymentId = `pay_sim_${userId}_${Date.now()}`;

            db.query(
              `
              INSERT INTO subscriptions (
                user_id,
                status,
                start_date,
                end_date,
                auto_renewal,
                monthly_price,
                currency,
                provider_subscription_id
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `,
              [
                userId,
                'active',
                formattedStartDate,
                formattedEndDate,
                true,
                10.00,
                'EUR',
                simulatedProviderSubscriptionId
              ],
              (subscriptionErr, subscriptionResult) => {
                if (subscriptionErr) {
                  return res.status(500).json({
                    message: 'Error creating subscription',
                    error: subscriptionErr.message
                  });
                }

                const subscriptionId = subscriptionResult.insertId;

                db.query(
                  `
                  INSERT INTO payments (
                    user_id,
                    subscription_id,
                    amount,
                    currency,
                    status,
                    provider_payment_id
                  )
                  VALUES (?, ?, ?, ?, ?, ?)
                  `,
                  [
                    userId,
                    subscriptionId,
                    10.00,
                    'EUR',
                    'completed',
                    simulatedProviderPaymentId
                  ],
                  (paymentErr, paymentResult) => {
                    if (paymentErr) {
                      return res.status(500).json({
                        message: 'Error creating payment',
                        error: paymentErr.message
                      });
                    }

                    return res.status(201).json({
                      message: 'Account created and subscription activated successfully',
                      email_sent: true,
                      user: {
                        id: userId,
                        name,
                        email,
                        role: 'subscriber'
                      },
                      subscription: {
                        id: subscriptionId,
                        status: 'active',
                        start_date: formattedStartDate,
                        end_date: formattedEndDate,
                        monthly_price: 10.00,
                        currency: 'EUR'
                      },
                      payment: {
                        id: paymentResult.insertId,
                        amount: 10.00,
                        currency: 'EUR',
                        status: 'completed'
                      }
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).json({
      message: 'Unexpected server error',
      error: error.message
    });
  }
});

app.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: 'Email is required'
    });
  }

  return res.json({
    message: 'If the email exists, password reset instructions have been sent.'
  });
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