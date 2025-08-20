const express = require('express');
const router = express.Router();
const db = require('../db');

// API cập nhật điểm
router.post('/update', (req, res) => {
    const { userId, score } = req.body;

    if (!userId || score == null) {
        return res.status(400).json({ message: 'Thiếu userId hoặc score' });
    }

    const sql = "UPDATE users SET score = ? WHERE id = ?";
    db.query(sql, [score, userId], (err, result) => {
        if (err) {
            console.error('Lỗi khi cập nhật điểm:', err);
            return res.status(500).json({ message: 'Lỗi server' });
        }
        res.json({ message: 'Cập nhật điểm thành công' });
    });
});

// API lấy điểm
router.get('/:userId', (req, res) => {
    const { userId } = req.params;

    db.query("SELECT score FROM users WHERE id = ?", [userId], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy điểm:', err);
            return res.status(500).json({ message: 'Lỗi server' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }
        res.json({ score: results[0].score });
    });
});

// API cập nhật kỷ lục game
router.post('/updateRecord', (req, res) => {
    const { gameId, userId, username, score, time } = req.body;

    if (!gameId || !userId || !username || score == null || time == null) {
        return res.status(400).json({ message: 'Thiếu tham số' });
    }

    // Lấy kỷ lục hiện tại của game
    const getGameSql = "SELECT * FROM games WHERE id = ?";
    db.query(getGameSql, [gameId], (err, results) => {
        if (err) {
            console.error("❌ Lỗi khi lấy game:", err);
            return res.status(500).json({ message: 'Lỗi server' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy game' });
        }

        const game = results[0];
        let updates = {};

        // So sánh với top1, top2, top3 (theo thời gian nhỏ hơn là tốt hơn)
        if (!game.top1_time || time < game.top1_time) {
            updates = {
                top3_score: game.top2_score,
                top3_time: game.top2_time,
                top3_username: game.top2_username,
                top2_score: game.top1_score,
                top2_time: game.top1_time,
                top2_username: game.top1_username,
                top1_score: score,
                top1_time: time,
                top1_username: username,
            };
        } else if (!game.top2_time || time < game.top2_time) {
            updates = {
                top3_score: game.top2_score,
                top3_time: game.top2_time,
                top3_username: game.top2_username,
                top2_score: score,
                top2_time: time,
                top2_username: username,
            };
        } else if (!game.top3_time || time < game.top3_time) {
            updates = {
                top3_score: score,
                top3_time: time,
                top3_username: username,
            };
        } else {
            return res.json({ message: "Chưa phá được kỷ lục nào", game });
        }

        // Tạo câu SQL update động
        const fields = Object.keys(updates).map(k => `${k} = ?`).join(", ");
        const values = Object.values(updates);
        values.push(gameId);

        const updateSql = `UPDATE games SET ${fields} WHERE id = ?`;
        db.query(updateSql, values, (err) => {
            if (err) {
                console.error("❌ Lỗi khi cập nhật kỷ lục:", err);
                return res.status(500).json({ message: 'Lỗi server' });
            }
            res.json({ message: "✅ Cập nhật kỷ lục thành công!", updates });
        });
    });
});

// API lấy leaderboard của 1 game
router.get('/leaderboard/:gameId', (req, res) => {
    const { gameId } = req.params;
    db.query("SELECT * FROM games WHERE id = ?", [gameId], (err, results) => {
        if (err) {
            console.error("❌ Lỗi khi lấy leaderboard:", err);
            return res.status(500).json({ message: "Lỗi server" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy game" });
        }
        const game = results[0];
        const leaderboard = [
            { rank: 1, username: game.top1_username, score: game.top1_score, time: game.top1_time },
            { rank: 2, username: game.top2_username, score: game.top2_score, time: game.top2_time },
            { rank: 3, username: game.top3_username, score: game.top3_score, time: game.top3_time },
        ].filter(p => p.username !== null); // loại bỏ rỗng
        res.json({ gameId, leaderboard });
    });
});




module.exports = router;
