// backend/index.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const gameRoutes = require("./routes/games");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api/games", gameRoutes);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});
