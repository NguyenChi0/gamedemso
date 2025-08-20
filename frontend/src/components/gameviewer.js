import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGameById, updateScore } from '../api';

const GameViewer = () => {
  const { id } = useParams();
  const [fileName, setFileName] = useState(null);
  const username = localStorage.getItem('username');

  useEffect(() => {
    getGameById(id)
      .then(res => setFileName(res.data.fileName))
      .catch(err => console.error(err));
  }, [id]);

  // Nhận điểm từ game trong iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.score !== undefined && username) {
        updateScore(username, event.data.score)
          .then(() => console.log("Điểm đã lưu:", event.data.score))
          .catch(err => console.error("Lỗi lưu điểm:", err));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [username]);

  if (!fileName) return <div>Đang tải game...</div>;

  return (
    <div style={{ height: '100vh' }}>
      <iframe
        src={`/games/${fileName}`}
        title={fileName}
        width="100%"
        height="100%"
        frameBorder="0"
      />
    </div>
  );
};

export default GameViewer;
