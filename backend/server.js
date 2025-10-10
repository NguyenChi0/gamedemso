// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// =========================
// DB Setup
// =========================
const pool = require('./db'); // db.js export mysql2/promise pool


// =========================
// EXPRESS SETUP
// =========================
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


// =========================
// ROUTES: HEALTH CHECK
// =========================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running 🚀',
    time: new Date().toISOString(),
  });
});


// =========================
// ROUTES: AUTH
// =========================

//Đăng ký và đăng nhập đơn giản (không mã hoá mật khẩu, chỉ demo)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Thiếu username hoặc password' });
    }

    const [result] = await pool.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password]
    );
    res.json({ message: 'Đăng ký thành công', userId: result.insertId });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Đăng ký thất bại' });
  }
});

//Đăng ký và đăng nhập đơn giản (không mã hoá mật khẩu, chỉ demo)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Thiếu username hoặc password' });
    }

    const [rows] = await pool.query(
      'SELECT id, username FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu' });
    }
    res.json({ message: 'Đăng nhập thành công', user: rows[0] });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});


// =========================
// ROUTES: GAMES
// =========================

// Lấy danh sách game
app.get('/api/games', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM games');
    res.json(rows);
  } catch (err) {
    console.error('Get games error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Lấy chi tiết game theo ID
app.get('/api/games/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Game not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get game by id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// ROUTES: SCORES
// =========================



/*

// 📥 API lưu điểm và thời gian
app.post("/api/scores/save", async (req, res) => {
  try {
    const { username, gameId, score, timeTaken } = req.body;

    if (!username || !gameId || !score || !timeTaken) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });
    }

    // Lấy user_id theo username
    const [userRows] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const userId = userRows[0].id;

    // Lưu điểm
    await pool.query(
      "INSERT INTO scores (user_id, game_id, score, time_taken) VALUES (?, ?, ?, ?)",
      [userId, gameId, score, timeTaken]
    );

    res.json({ success: true, message: "Lưu điểm thành công!" });
  } catch (err) {
    console.error("Save score error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


*/

app.post("/api/scores/save", async (req, res) => {
  const { username, gameId, score, timeTaken } = req.body;

  try {
    if (!username || !gameId || !score || !timeTaken) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });
    }

    // Tìm hoặc tạo user
    const [userRows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    let userId;
    if (userRows.length > 0) {
      userId = userRows[0].id;
    } else {
      const [insertUser] = await pool.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, "123"]
      );
      userId = insertUser.insertId;
    }

    //  Lưu điểm vào bảng scores
    await pool.query(
      "INSERT INTO scores (user_id, game_id, score, time_taken) VALUES (?, ?, ?, ?)",
      [userId, gameId, score, timeTaken]
    );

    // Lấy danh sách leaderboard hiện tại
    const [leaders] = await pool.query(
      "SELECT * FROM leaderboard WHERE game_id = ? ORDER BY score DESC, time_taken ASC",
      [gameId]
    );

    // Tìm vị trí nên chèn (xác định rank)
    let insertRank = null;
    for (let i = 0; i < leaders.length; i++) {
      const l = leaders[i];
      if (score > l.score || (score === l.score && timeTaken < l.time_taken)) {
        insertRank = i + 1;
        break;
      }
    }

    // Nếu leaderboard chưa đủ 3 người → chèn vào cuối nếu chưa vượt ai
    if (insertRank === null && leaders.length < 3) {
      insertRank = leaders.length + 1;
    }

    // Nếu không đủ điều kiện lọt top
    if (insertRank === null) {
      return res.json({ success: true, message: "Điểm đã lưu, nhưng chưa đủ lọt top 3." });
    }

    //  Dời thứ hạng người khác xuống
    await pool.query(
      "UPDATE leaderboard SET `rank` = `rank` + 1 WHERE game_id = ? AND `rank` >= ?",
      [gameId, insertRank]
    );

    // Chèn người chơi mới vào vị trí đó
    await pool.query(
      "INSERT INTO leaderboard (game_id, user_id, `rank`, score, time_taken) VALUES (?, ?, ?, ?, ?)",
      [gameId, userId, insertRank, score, timeTaken]
    );

    // Xóa người thứ 4 trở đi (chỉ giữ top 3)
    await pool.query(
      "DELETE FROM leaderboard WHERE game_id = ? AND `rank` > 3",
      [gameId]
    );

    return res.json({ success: true, message: `🎉 Bạn đã lọt vào top ${insertRank}!` });

  } catch (err) {
    console.error("Save score error:", err);
    return res.status(500).json({ success: false, message: "Lỗi server khi lưu điểm." });
  }
});

// =========================
// API lấy leaderboard (xếp hạng)
// =========================
app.get("/api/scores/leaderboard", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        l.game_id,
        g.name AS game_name,
        u.username,
        l.score,
        l.time_taken,
        l.created_at
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      JOIN games g ON l.game_id = g.id
      ORDER BY l.score DESC, l.time_taken ASC
      LIMIT 20
    `);
    res.json(rows);
  } catch (err) {
    console.error("Get leaderboard error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});



// =========================
// ROUTES: USERS
// =========================

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id, username, created_at FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get user by id error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Thiếu username' });

    await pool.query('UPDATE users SET username = ? WHERE id = ?', [username, id]);
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Đã xoá user' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
