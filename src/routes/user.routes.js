const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, userController.getUser);
router.post('/upload-image', authMiddleware, userController.uploadImage);
router.put('/edit', authMiddleware, userController.editUser);
router.delete('/delete-image', authMiddleware, userController.deleteImage);

module.exports = router;