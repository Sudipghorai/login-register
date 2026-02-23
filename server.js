const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
require('dotenv').config();

// ✅ CORS Middleware
app.use(cors({
    origin: '*',
}));

app.use(express.json());


// ✅ Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/users',userRoutes);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} ✅`);
});