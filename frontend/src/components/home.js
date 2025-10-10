import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGames, getLeaderboard } from '../api';
import axios from 'axios';
import './home.css';

function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [games, setGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [hoveredGame, setHoveredGame] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) setUsername(savedUser);

    // Lấy danh sách game
    getGames()
      .then(res => setGames(res.data))
      .catch(err => console.error(err));

    // Lấy dữ liệu leaderboard
    // Lấy dữ liệu leaderboard từ API thật
  getLeaderboard()
    .then(res => setLeaderboard(res.data))
    .catch(err => console.error("Lỗi lấy leaderboard:", err));

  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUsername('');
  };

  const handleGameClick = (id) => {
    navigate(`/game/${id}`);
  };

  // Hàm lọc top 3 theo từng game
  const getTopPlayersByGame = (gameId) => {
    const filtered = leaderboard
      .filter(item => item.game_id === gameId)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.time_taken - b.time_taken;
      })
      .slice(0, 3); // chỉ lấy top 3
    return filtered;
  };

  return (
    <div className="home-container">
      {/* header */}
      <div className="home-header">
        <div className="header-content">
          <h1 className="main-title">🎮 Game Center</h1>
          <p className="subtitle">Khám phá thế giới trò chơi đầy thú vị</p>
        </div>
      </div>

      {/* user */}
      <div className="user-section">
        {username ? (
          <div className="user-welcome">
            <div className="user-info">
              <span className="welcome-text">Xin chào, </span>
              <span className="username">{username}</span>
              <span className="welcome-emoji">👋</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <span className="btn-icon">🚪</span>
              Đăng xuất
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <button
              className="auth-btn register-btn"
              onClick={() => navigate('/register')}
            >
              <span className="btn-icon">📝</span>
              Đăng ký
            </button>
            <button
              className="auth-btn login-btn"
              onClick={() => navigate('/login')}
            >
              <span className="btn-icon">🔑</span>
              Đăng nhập
            </button>
          </div>
        )}
      </div>

      {/* main */}
      <div className="main-content">
        <div className="section-header">
          <h2 className="section-title">🎯 Trò chơi & Bảng xếp hạng</h2>
          <p className="section-subtitle">Chọn trò chơi và xem thành tích</p>
        </div>

        <div className="games-leaderboard-container">
          {games.map((game) => {
            const topPlayers = getTopPlayersByGame(game.id);

            return (
              <div
                key={game.id}
                className="game-leaderboard-card"
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
              >
                <div className="card-content">
                  {/* Game Section - Bên trái */}
                  <div className="game-section">
                    <div className="game-header">
                      <h3 className="game-name">{game.name}</h3>
                    </div>

                    {/* Ảnh game */}
                    <div className="game-image-container">
                      <img
  src={`http://210.245.52.119/gamedemso${game.image_path}`}
  alt={game.name}
  className="game-image"
/>

                    </div>

                    {/* Nút chơi ngay */}
                    <button
                      className="play-btn"
                      onClick={() => handleGameClick(game.id)}
                    >
                      <span className="play-icon">▶</span>
                      Chơi ngay
                    </button>
                  </div>

                  {/* Leaderboard Section - Bên phải */}
                  <div className="leaderboard-section">
                    <div className="leaderboard-header">
                      <h4 className="leaderboard-title">🏆 Top người chơi</h4>
                    </div>
                    <div className="leaderboard-content">
                      {/* Top 1 */}
                      <div className="leaderboard-item top1">
                        <div className="stars-container">
                          <div className="star"></div>
                          <div className="star"></div>
                          <div className="star"></div>
                          <div className="star"></div>
                          <div className="star"></div>
                        </div>
                        <div className="rank-info">
                          <span className="medal">🥇</span>
                          <span className="rank">1</span>
                        </div>
                        <div className="player-info">
                          <div className="player-name">
                            {topPlayers[0]?.username || 'Chưa có'}
                          </div>
                          <div className="player-stats">
                            <span className="score">
                              {topPlayers[0]?.score || 0} điểm
                            </span>
                            <span className="time">
                              {topPlayers[0]?.time_taken?.toFixed(2) || ''}s
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Top 2 */}
                      <div className="leaderboard-item top2">
                        <div className="top2-effects">
                          <div className="silver-crystal"></div>
                          <div className="silver-crystal"></div>
                          <div className="silver-crystal"></div>
                          <div className="silver-crystal"></div>
                        </div>
                        <div className="rank-info">
                          <span className="medal">🥈</span>
                          <span className="rank">2</span>
                        </div>
                        <div className="player-info">
                          <div className="player-name">
                            {topPlayers[1]?.username || 'Chưa có'}
                          </div>
                          <div className="player-stats">
                            <span className="score">
                              {topPlayers[1]?.score || 0} điểm
                            </span>
                            <span className="time">
                              {topPlayers[1]?.time_taken?.toFixed(2) || ''}s
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Top 3 */}
                      <div className="leaderboard-item top3">
                        <div className="top3-effects">
                          <div className="bronze-leaf"></div>
                          <div className="bronze-leaf"></div>
                          <div className="bronze-leaf"></div>
                          <div className="bronze-leaf"></div>
                        </div>
                        <div className="rank-info">
                          <span className="medal">🥉</span>
                          <span className="rank">3</span>
                        </div>
                        <div className="player-info">
                          <div className="player-name">
                            {topPlayers[2]?.username || 'Chưa có'}
                          </div>
                          <div className="player-stats">
                            <span className="score">
                              {topPlayers[2]?.score || 0} điểm
                            </span>
                            <span className="time">
                              {topPlayers[2]?.time_taken?.toFixed(2) || ''}s
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/*
                {hoveredGame === game.id && (
                  <div
                    className="game-preview"
                    onClick={() => handleGameClick(game.id)}
                  >
                    <video
                      src={game.videodemo}
                      autoPlay
                      muted
                      loop
                      className="preview-video"
                    >
                      Trình duyệt không hỗ trợ video.
                    </video>
                  </div>
                )}
                */}

                
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home;
