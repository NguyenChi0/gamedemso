import axios from "axios";

const API_URL = "http://210.245.52.119/api_gamedemso/api/";

// =============================
// AUTH (Đăng nhập / Đăng ký)
// =============================
export const registerUser = (username, password) =>
  axios.post(`${API_URL}/auth/register`, { username, password });

export const loginUser = (username, password) =>
  axios.post(`${API_URL}/auth/login`, { username, password });

// =============================
// GAMES (Danh sách & chi tiết game)
// =============================
export const getGames = () => axios.get(`${API_URL}/games`);

export const getGameById = (id) => axios.get(`${API_URL}/games/${id}`);

// =============================
// SCORES (Lưu điểm & leaderboard)
// =============================
export const saveScore = (gameId, username, score, timeTaken) =>
  axios.post(`${API_URL}/scores/save`, { gameId, username, score, timeTaken });

export const getLeaderboard = () =>
  axios.get(`${API_URL}/scores/leaderboard`);

// =============================
// USERS (Quản lý người dùng)
// =============================
export const getUsers = () => axios.get(`${API_URL}/users`);

export const getUserById = (id) => axios.get(`${API_URL}/users/${id}`);

export const updateUser = (id, username) =>
  axios.put(`${API_URL}/users/${id}`, { username });

export const deleteUser = (id) =>
  axios.delete(`${API_URL}/users/${id}`);
