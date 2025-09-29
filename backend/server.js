// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db'); // <-- đảm bảo file ./db export connection (mysql2/mariadb)

// App setup
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// =========================
// ROUTES: AUTH
// =========================
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Thiếu username hoặc password' });

  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error('Register error:', err);
      return res.status(500).json({ error: 'Đăng ký thất bại' });
    }
    res.json({ message: 'Đăng ký thành công', userId: result.insertId });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Thiếu username hoặc password' });

  const sql = 'SELECT id, username FROM users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Lỗi máy chủ' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu' });
    }
    res.json({ message: 'Đăng nhập thành công', user: results[0] });
  });
});

// =========================
// ROUTES: HEALTH CHECK
// =========================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running 🚀',
    time: new Date().toISOString()
  });
});


// =========================
// ROUTES: GAMES
// =========================
app.get('/api/games', (req, res) => {
  db.query('SELECT * FROM games', (err, results) => {
    if (err) {
      console.error('Get games error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/api/games/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM games WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Get game by id error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) return res.status(404).json({ error: 'Game not found' });
    res.json(results[0]);
  });
});

// =========================
// ROUTES: SCORES
// =========================
// Lưu điểm (submit score)
app.post('/api/scores', (req, res) => {
  const { user_id, game_id, score, time } = req.body;
  if (user_id == null || game_id == null || score == null) {
    return res.status(400).json({ error: 'Thiếu user_id, game_id hoặc score' });
  }

  const sql = `INSERT INTO scores (user_id, game_id, score, time, created_at)
               VALUES (?, ?, ?, ?, NOW())`;
  db.query(sql, [user_id, game_id, score, time || null], (err, result) => {
    if (err) {
      console.error('Insert score error:', err);
      return res.status(500).json({ error: 'Không thể lưu điểm' });
    }
    res.json({ message: 'Lưu điểm thành công', scoreId: result.insertId });
  });
});

// Lấy tất cả điểm (tuỳ chỉnh)
app.get('/api/scores', (req, res) => {
  db.query('SELECT * FROM scores ORDER BY created_at DESC LIMIT 200', (err, results) => {
    if (err) {
      console.error('Get scores error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Lấy top N cho 1 game
function getTopScoresHandler(req, res) {
  const { gameId } = req.params;
  // nếu route có :limit thì req.params.limit sẽ có giá trị, ngược lại undefined
  const limitParam = req.params.limit;
  const lim = parseInt(limitParam, 10) || 10;

  const sql = `SELECT s.*, u.username
               FROM scores s
               LEFT JOIN users u ON u.id = s.user_id
               WHERE s.game_id = ?
               ORDER BY s.score DESC, s.time ASC
               LIMIT ?`;
  db.query(sql, [gameId, lim], (err, results) => {
    if (err) {
      console.error('Get top scores error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
}

// Route có limit
app.get('/api/scores/game/:gameId/top/:limit', getTopScoresHandler);

// Route không có limit (sử dụng default)
app.get('/api/scores/game/:gameId/top', getTopScoresHandler);


// Lấy điểm của 1 user
app.get('/api/scores/user/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = 'SELECT * FROM scores WHERE user_id = ? ORDER BY created_at DESC';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Get user scores error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// =========================
// ROUTES: USERS
// =========================
// Lấy danh sách users (ẩn password)
app.get('/api/users', (req, res) => {
  db.query('SELECT id, username, created_at FROM users', (err, results) => {
    if (err) {
      console.error('Get users error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Lấy user theo id
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT id, username, created_at FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Get user by id error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  });
});

// Cập nhật user (ví dụ đổi username)
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Thiếu username' });

  db.query('UPDATE users SET username = ? WHERE id = ?', [username, id], (err, result) => {
    if (err) {
      console.error('Update user error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Cập nhật thành công' });
  });
});

// Xoá user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Delete user error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Đã xoá user' });
  });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
