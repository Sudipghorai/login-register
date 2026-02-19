const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

// ✅ CORS Middleware
app.use(cors({
    origin: '*',              
}));

app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} ✅`);
});