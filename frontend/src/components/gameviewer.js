import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGameById, saveScore, getGames } from '../api';

const GameViewer = () => {
  const { id } = useParams();
  const [fileName, setFileName] = useState(null);
  const [relatedGames, setRelatedGames] = useState([]);
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  useEffect(() => {
    getGameById(id)
      .then(res => setFileName(res.data.fileName))
      .catch(err => console.error(err));
  }, [id]);

  useEffect(() => {
    getGames()
      .then(res => {
        const games = res.data.filter(g => g.id !== Number(id));
        setRelatedGames(games.slice(0, 5));
      })
      .catch(err => console.error(err));
  }, [id]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.score !== undefined) {
        const { score, time } = event.data;

        const userId = localStorage.getItem("userId");
        const username = localStorage.getItem("username");
        const gameId = Number(id);

        if (!userId || !username) {
          console.error("⚠️ Chưa có userId/username trong localStorage");
          return;
        }

        saveScore(gameId, username, score, time)
          .then(() => console.log("✅ Điểm đã lưu:", score))
          .catch(err => console.error("❌ Lỗi lưu điểm:", err));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [id]);

  // CSS styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      padding: '0',
      margin: '0',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    backButton: {
      background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
      border: 'none',
      padding: '0.8rem 1.5rem',
      borderRadius: '12px',
      color: 'white',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      margin: '1rem'
    },
    iframeContainer: {
      height: '80vh',
      padding: '0 1rem'
    },
    mainContent: {
      padding: '2rem'
    },
    sectionTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '2rem',
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    relatedGamesContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '1.5rem',
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    relatedGameCard: {
      background: 'linear-gradient(145deg, #2c2c2c, #3a3a3a)',
      borderRadius: '20px',
      padding: '1.5rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.1)',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      height: '300px',
      ':hover': {
        transform: 'translateY(-10px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }
    },
    cardContent: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'space-between'
    },
    gameSection: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    gameHeader: {
      marginBottom: '1rem'
    },
    gameName: {
      fontSize: '1.1rem',
      fontWeight: '600',
      textAlign: 'center',
      margin: '0 0 1rem 0',
      color: '#fff',
      minHeight: '3rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    gameImageContainer: {
      width: '100%',
      height: '150px',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '1rem',
      backgroundColor: '#1a1a1a'
    },
    gameImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s ease'
    },
    playBtn: {
      background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
      border: 'none',
      padding: '0.8rem 1.2rem',
      borderRadius: '50px',
      color: 'white',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(255,107,107,0.3)',
      transition: 'all 0.3s ease',
      width: '100%',
      fontSize: '0.9rem',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(255,107,107,0.4)'
      }
    }
  };

  if (!fileName) return <div>Đang tải game...</div>;

  return (
    <div style={styles.container}>
      {/* Nút back */}
      <div>
        <button
          onClick={() => navigate('/')}
          style={styles.backButton}
        >
          ⬅️ Quay lại Home
        </button>
      </div>

      {/* Iframe game */}
      <div style={styles.iframeContainer}>
        <iframe
          src={`${process.env.PUBLIC_URL}/games/${fileName}`}
          title={fileName}
          width="100%"
          height="110%"
          frameBorder="0"
        />
      </div>

      {/* Games liên quan */}
      <div style={styles.mainContent}>
        <h2 style={styles.sectionTitle}>🎮 Game liên quan</h2>
        <div style={styles.relatedGamesContainer}>
          {relatedGames.map((game) => (
            <div key={game.id} style={styles.relatedGameCard}>
              <div style={styles.cardContent}>
                <div style={styles.gameSection}>
                  <div style={styles.gameHeader}>
                    <h3 style={styles.gameName}>{game.name}</h3>
                  </div>
                  <div style={styles.gameImageContainer}>
                    <img
                      src={process.env.PUBLIC_URL + game.image_path}
                      alt={game.name}
                      style={styles.gameImage}
                    />
                  </div>
                  <Link to={`/game/${game.id}`} style={{ textDecoration: 'none' }}>
                    <button style={styles.playBtn}>
                      ▶ Chơi ngay
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameViewer;