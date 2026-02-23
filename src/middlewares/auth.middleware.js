const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHandler');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return errorResponse(res, 401, 'Invalid or expired token.');
    }
};

module.exports = authMiddleware;