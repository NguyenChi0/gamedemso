const express = require('express');
const router = express.Router();
const db = require('../db');

// Lấy danh sách tất cả game
router.get('/', (req, res) => {
  db.query('SELECT * FROM games', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Lấy game theo ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM games WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Game not found' });
    res.json(results[0]);
  });
});

module.exports = router;
