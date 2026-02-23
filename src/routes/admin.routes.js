const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminMiddleware = require('../middlewares/admin.middleware');

// ✅ Admin Auth
router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.post('/send-otp', adminController.sendOtp);
router.post('/verify-otp', adminController.verifyOtp);

// ✅ User Management (admin token required)
router.get('/users', adminMiddleware, adminController.getAllUsers);
router.get('/users/:userid', adminMiddleware, adminController.getUserById);
router.post('/users/add', adminMiddleware, adminController.addUser);
router.put('/users/update/:userid', adminMiddleware, adminController.updateUser);
router.delete('/users/delete/:userid', adminMiddleware, adminController.deleteUser);

module.exports = router;