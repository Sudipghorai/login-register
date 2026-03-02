const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const adminMiddleware = require('../middlewares/admin.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

// ✅ Admin Routes (admin token required)
router.post('/admin/add', adminMiddleware, productController.addProduct);
router.get('/admin/all', adminMiddleware, productController.getAllProductsAdmin);
router.get('/admin/:productid', adminMiddleware, productController.getProductAdmin);
router.put('/admin/update/:productid', adminMiddleware, productController.updateProduct);
router.delete('/admin/delete/:productid', adminMiddleware, productController.deleteProduct);

// ✅ User Routes (user token required)
router.get('/user/all', authMiddleware, productController.getAllProductsUser);
router.get('/user/:productid', authMiddleware, productController.getProductUser);

module.exports = router;