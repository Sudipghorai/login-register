const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();

app.use(cors({
    origin: '*',
}));

app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true
}));

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const productRoutes = require('./routes/product.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/products', productRoutes);

module.exports = app;