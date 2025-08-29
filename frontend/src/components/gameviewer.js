import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGameById, updateScore, updateRecord } from '../api';

const GameViewer = () => {
  const { id } = useParams();
  const [fileName, setFileName] = useState(null);

  const userId = localStorage.getItem('userId');   // cần có trong localStorage
  const username = localStorage.getItem('username');

  useEffect(() => {
    getGameById(id)
      .then(res => setFileName(res.data.fileName))
      .catch(err => console.error(err));
  }, [id]);

  useEffect(() => {
  const handleMessage = (event) => {
    if (event.data.score !== undefined) {
      const { score, time } = event.data;

      const userId = localStorage.getItem("userId");  // phải có
      const username = localStorage.getItem("username"); 
      const gameId = Number(id); // lấy từ useParams

      if (!userId || !username) {
        console.error("⚠️ Chưa có userId/username trong localStorage");
        return;
      }

      // cập nhật điểm user
      updateScore(Number(userId), score)
        .then(() => console.log("✅ Điểm đã lưu:", score))
        .catch(err => console.error("❌ Lỗi lưu điểm:", err));

      // cập nhật kỷ lục game
      updateRecord(gameId, Number(userId), username, score, time)
        .then(() => console.log("✅ Kỷ lục game đã cập nhật"))
        .catch(err => console.error("❌ Lỗi updateRecord:", err));
    }
  };

  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
}, [id]);


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
