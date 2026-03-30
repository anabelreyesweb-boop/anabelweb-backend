const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});