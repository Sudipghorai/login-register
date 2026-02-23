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
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/users',userRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} ✅`);
});