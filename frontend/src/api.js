import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Auth
export const loginUser = (username, password) =>
  axios.post(`${API_URL}/auth/login`, { username, password });

export const registerUser = (username, password) =>
  axios.post(`${API_URL}/auth/register`, { username, password });

// Games
export const getGames = () => axios.get(`${API_URL}/games`);
export const getGameById = (id) => axios.get(`${API_URL}/games/${id}`);

// Score (user cá nhân)
export const updateScore = (userId, score) =>
  axios.post(`${API_URL}/scores/update`, { userId, score });

export const getScore = (userId) =>
  axios.get(`${API_URL}/scores/${userId}`);

// Record (bảng xếp hạng theo game)
export const updateRecord = (gameId, userId, username, score, time) =>
  axios.post(`${API_URL}/scores/updateRecord`, {
    gameId,
    userId,
    username,
    score,
    time,
  });

export const getLeaderboard = (gameId) =>
  axios.get(`${API_URL}/scores/leaderboard/${gameId}`);
