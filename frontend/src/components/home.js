import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGames } from '../api';

function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [games, setGames] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) setUsername(savedUser);

    getGames()
      .then(res => setGames(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUsername('');
  };

  const handleGameClick = (id) => {
    navigate(`/game/${id}`);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>🌟 Chào mừng bạn đến với Website</h1>

      {/* Nếu có username thì chào và cho logout */}
      {username ? (
        <>
          <h2>Xin chào, {username} 👋</h2>
          <button onClick={handleLogout}>Đăng xuất</button>
        </>
      ) : (
        <>
          <button onClick={() => navigate('/register')}>Đăng ký</button>
          <button
            onClick={() => navigate('/login')}
            style={{ marginLeft: '10px' }}
          >
            Đăng nhập
          </button>
        </>
      )}

      {/* Danh sách game luôn hiển thị */}
      <h3 style={{ marginTop: '30px' }}>🎮 Danh sách trò chơi:</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {games.map(game => (
          <li key={game.id} style={{ margin: '10px' }}>
            <button onClick={() => handleGameClick(game.id)}>
              {game.name}
            </button>
          </li>
        ))}
      </ul>

      {/* Bảng xếp hạng luôn hiển thị */}
      <h3 style={{ marginTop: '40px' }}>🏆 Bảng xếp hạng</h3>
      {games.map(game => (
        <div
          key={game.id}
          style={{
            margin: '20px auto',
            width: '70%',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px',
            backgroundColor: '#f9f9f9'
          }}
        >
          <h4 style={{ marginBottom: '10px' }}>{game.name}</h4>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'center'
            }}
            border="1"
          >
            <thead>
              <tr style={{ backgroundColor: '#ddd' }}>
                <th>Hạng</th>
                <th>Người chơi</th>
                <th>Điểm</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🥇</td>
                <td>{game.top1_username || '-'}</td>
                <td>{game.top1_score}</td>
                <td>{game.top1_time || '-'}</td>
              </tr>
              <tr>
                <td>🥈</td>
                <td>{game.top2_username || '-'}</td>
                <td>{game.top2_score}</td>
                <td>{game.top2_time || '-'}</td>
              </tr>
              <tr>
                <td>🥉</td>
                <td>{game.top3_username || '-'}</td>
                <td>{game.top3_score}</td>
                <td>{game.top3_time || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default Home;
