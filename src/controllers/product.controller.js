const productService = require('../services/product.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// ✅ Add Product (Admin only)
const addProduct = async (req, res) => {
    const { product_name, price, description } = req.body;

    if (!product_name || !price || !description)
        return errorResponse(res, 400, 'product_name, price and description are required');

    let fileBuffer = null;
    if (req.files && req.files.product_image) {
        const file = req.files.product_image;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype))
            return errorResponse(res, 400, 'Only images allowed (jpeg, jpg, png, webp)');
        fileBuffer = file.data;
    }

    try {
        const productId = await productService.addProduct(req.admin.adminid, product_name, price, description, fileBuffer);
        return successResponse(res, 201, 'Product added successfully', { productId });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

// ✅ Get All Products (Admin)
const getAllProductsAdmin = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        return successResponse(res, 200, 'Products fetched successfully', { products });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

// ✅ Get Single Product (Admin)
const getProductAdmin = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.productid);
        return successResponse(res, 200, 'Product fetched successfully', { product });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

// ✅ Update Product (Admin)
const updateProduct = async (req, res) => {
    const { product_name, price, description } = req.body;

    if (!product_name || !price || !description)
        return errorResponse(res, 400, 'product_name, price and description are required');

    let fileBuffer = null;
    if (req.files && req.files.product_image) {
        const file = req.files.product_image;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype))
            return errorResponse(res, 400, 'Only images allowed (jpeg, jpg, png, webp)');
        fileBuffer = file.data;
    }

    try {
        const product = await productService.updateProduct(req.params.productid, product_name, price, description, fileBuffer);
        return successResponse(res, 200, 'Product updated successfully', { product });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

// ✅ Delete Product (Admin)
const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.productid);
        return successResponse(res, 200, 'Product deleted successfully');
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

// ✅ Get All Products (User - public)
const getAllProductsUser = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        return successResponse(res, 200, 'Products fetched successfully', { products });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

// ✅ Get Single Product (User - public)
const getProductUser = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.productid);
        return successResponse(res, 200, 'Product fetched successfully', { product });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

module.exports = { addProduct, getAllProductsAdmin, getProductAdmin, updateProduct, deleteProduct, getAllProductsUser, getProductUser };