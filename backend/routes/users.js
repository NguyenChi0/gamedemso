const express = require('express');
const router = express.Router();
const db = require('../db'); // kết nối MySQL

// API lấy bảng tổng điểm
router.get('/scores', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT username, score 
      FROM users 
      ORDER BY score DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy điểm' });
  }
});

module.exports = router;
