import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [games, setGames] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) {
      setUsername(savedUser);
    }

    // Gọi API lấy danh sách game
    axios.get('http://localhost:5000/api/games')
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

      {username ? (
        <>
          <h2>Xin chào, {username} 👋</h2>
          <button onClick={handleLogout}>Đăng xuất</button>

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
        </>
      ) : (
        <>
          <button onClick={() => navigate('/register')}>Đăng ký</button>
          <button onClick={() => navigate('/login')} style={{ marginLeft: '10px' }}>
            Đăng nhập
          </button>
        </>
      )}
    </div>
  );
}

export default Home;
