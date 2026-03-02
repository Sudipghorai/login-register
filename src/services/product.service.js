const db = require('../config/db');
const { uploadImage, deleteImage } = require('./imagekit.service');

// ✅ Add Product
const addProduct = (adminid, product_name, price, description, fileBuffer) => {
    return new Promise(async (resolve, reject) => {
        try {
            let imageUrl = null;
            let imagekitFileId = null;

            if (fileBuffer) {
                const uploadResponse = await uploadImage(fileBuffer, `product_${Date.now()}`);
                imageUrl = uploadResponse.url;
                imagekitFileId = uploadResponse.fileId;
            }

            const insertQuery = `
                INSERT INTO products (product_name, product_image, imagekit_file_id, price, description, created_by)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            db.query(insertQuery, [product_name, imageUrl, imagekitFileId, price, description, adminid], (err, result) => {
                if (err) return reject(err);
                resolve(result.insertId);
            });
        } catch (err) {
            reject(err);
        }
    });
};

// ✅ Get All Products
const getAllProducts = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.productid, p.product_name, p.product_image, p.price, p.description, p.created_at,
                   a.firstname AS admin_firstname, a.lastname AS admin_lastname
            FROM products p
            JOIN admin1 a ON p.created_by = a.adminid
            ORDER BY p.created_at DESC
        `;
        db.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// ✅ Get Single Product
const getProductById = (productid) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.productid, p.product_name, p.product_image, p.price, p.description, p.created_at,
                   a.firstname AS admin_firstname, a.lastname AS admin_lastname
            FROM products p
            JOIN admin1 a ON p.created_by = a.adminid
            WHERE p.productid = ?
        `;
        db.query(query, [productid], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return reject({ status: 404, message: 'Product not found' });
            resolve(results[0]);
        });
    });
};

// ✅ Update Product
const updateProduct = (productid, product_name, price, description, fileBuffer) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Get old product
            const getOld = 'SELECT * FROM products WHERE productid = ?';
            db.query(getOld, [productid], async (err, result) => {
                if (err) return reject(err);
                if (result.length === 0) return reject({ status: 404, message: 'Product not found' });

                let imageUrl = result[0].product_image;
                let imagekitFileId = result[0].imagekit_file_id;

                if (fileBuffer) {
                    // Delete old image from ImageKit
                    if (imagekitFileId) {
                        try { await deleteImage(imagekitFileId); } catch (e) { console.error(e); }
                    }

                    // Upload new image
                    const uploadResponse = await uploadImage(fileBuffer, `product_${Date.now()}`);
                    imageUrl = uploadResponse.url;
                    imagekitFileId = uploadResponse.fileId;
                }

                const updateQuery = `
                    UPDATE products 
                    SET product_name=?, product_image=?, imagekit_file_id=?, price=?, description=?
                    WHERE productid=?
                `;
                db.query(updateQuery, [product_name, imageUrl, imagekitFileId, price, description, productid], (err) => {
                    if (err) return reject(err);
                    resolve({ productid, product_name, product_image: imageUrl, price, description });
                });
            });
        } catch (err) {
            reject(err);
        }
    });
};

// ✅ Delete Product
const deleteProduct = (productid) => {
    return new Promise(async (resolve, reject) => {
        const getProduct = 'SELECT * FROM products WHERE productid = ?';
        db.query(getProduct, [productid], async (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject({ status: 404, message: 'Product not found' });

            // Delete image from ImageKit
            if (result[0].imagekit_file_id) {
                try { await deleteImage(result[0].imagekit_file_id); } catch (e) { console.error(e); }
            }

            const deleteQuery = 'DELETE FROM products WHERE productid = ?';
            db.query(deleteQuery, [productid], (err) => {
                if (err) return reject(err);
                resolve('Product deleted successfully');
            });
        });
    });
};

module.exports = { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct };