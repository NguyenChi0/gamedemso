import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const GameViewer = () => {
  const { id } = useParams();
  const [fileName, setFileName] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/games/${id}`)
      .then(res => setFileName(res.data.fileName))
      .catch(err => console.error(err));
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
