const jwt = require('jsonwebtoken');
const path = require('path');
const { errorResponse } = require('../utils/responseHandler');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const adminMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Check if role is admin
        if (decoded.role !== 'admin') {
            return errorResponse(res, 403, 'Access denied. Admins only.');
        }

        req.admin = decoded;
        next();
    } catch (err) {
        return errorResponse(res, 401, 'Invalid or expired token.');
    }
};

module.exports = adminMiddleware;