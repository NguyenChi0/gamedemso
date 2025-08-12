// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Đăng ký
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(sql, [username, password], (err, result) => {
    if (err) return res.status(500).json({ error: 'Đăng ký thất bại' });
    res.json({ message: 'Đăng ký thành công' });
  });
});

// Đăng nhập
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi máy chủ' });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu' });
    }
    res.json({ message: 'Đăng nhập thành công', user: results[0] });
  });
});

module.exports = router;
