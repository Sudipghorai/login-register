const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
require('dotenv').config();

// ✅ GET USER PROFILE
router.get('/', authMiddleware, (req, res) => {
    const query = `
        SELECT userid, firstname, lastname, email, mobilenumber, profile_image 
        FROM users1 
        WHERE userid = ?
    `;

    db.query(query, [req.user.userid], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching user', error: err });

        if (results.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = results[0];

        // ✅ Add full image URL if image exists
        if (user.profile_image) {
            user.profile_image = `${req.protocol}://${req.get('host')}/uploads/${user.profile_image}`;
        }

        return res.status(200).json({
            message: 'User fetched successfully',
            user
        });
    });
});

// ✅ EDIT USER PROFILE (with optional image)
router.put('/edit', authMiddleware, upload.single('profile_image'), (req, res) => {
    const { firstname, lastname, email, mobilenumber } = req.body;

    if (!firstname || !lastname || !email || !mobilenumber) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // If new image uploaded, delete old image first
    if (req.file) {
        const getOldImage = 'SELECT profile_image FROM users1 WHERE userid = ?';
        db.query(getOldImage, [req.user.userid], (err, result) => {
            if (err) console.error('Error fetching old image:', err);

            if (result && result[0] && result[0].profile_image) {
                const oldImagePath = path.join(__dirname, '../uploads', result[0].profile_image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath); // Delete old image from disk
                }
            }
        });
    }

    const newImage = req.file ? req.file.filename : null;

    const updateQuery = newImage
        ? `UPDATE users1 SET firstname=?, lastname=?, email=?, mobilenumber=?, profile_image=? WHERE userid=?`
        : `UPDATE users1 SET firstname=?, lastname=?, email=?, mobilenumber=? WHERE userid=?`;

    const params = newImage
        ? [firstname, lastname, email, mobilenumber, newImage, req.user.userid]
        : [firstname, lastname, email, mobilenumber, req.user.userid];

    db.query(updateQuery, params, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating user', error: err });

        if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });

        // Return updated user
        const getUser = `SELECT userid, firstname, lastname, email, mobilenumber, profile_image FROM users1 WHERE userid = ?`;
        db.query(getUser, [req.user.userid], (err, results) => {
            if (err) return res.status(500).json({ message: 'Error fetching updated user' });

            const user = results[0];
            if (user.profile_image) {
                user.profile_image = `${req.protocol}://${req.get('host')}/uploads/${user.profile_image}`;
            }

            return res.status(200).json({
                message: 'User updated successfully',
                user
            });
        });
    });
});

// ✅ UPLOAD PROFILE IMAGE ONLY
router.post('/upload-image', authMiddleware, upload.single('profile_image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
    }

    // Delete old image if exists
    const getOldImage = 'SELECT profile_image FROM users1 WHERE userid = ?';
    db.query(getOldImage, [req.user.userid], (err, result) => {
        if (result && result[0] && result[0].profile_image) {
            const oldImagePath = path.join(__dirname, '../uploads', result[0].profile_image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Save new image
        const updateImage = 'UPDATE users1 SET profile_image = ? WHERE userid = ?';
        db.query(updateImage, [req.file.filename, req.user.userid], (err) => {
            if (err) return res.status(500).json({ message: 'Error saving image', error: err });

            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            return res.status(200).json({
                message: 'Profile image uploaded successfully',
                profile_image: imageUrl
            });
        });
    });
});

// ✅ DELETE PROFILE IMAGE
router.delete('/delete-image', authMiddleware, (req, res) => {
    const getImage = 'SELECT profile_image FROM users1 WHERE userid = ?';
    db.query(getImage, [req.user.userid], (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err });

        if (!result[0].profile_image) {
            return res.status(404).json({ message: 'No profile image found' });
        }

        // Delete from disk
        const imagePath = path.join(__dirname, '../uploads', result[0].profile_image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Remove from DB
        const removeImage = 'UPDATE users1 SET profile_image = NULL WHERE userid = ?';
        db.query(removeImage, [req.user.userid], (err) => {
            if (err) return res.status(500).json({ message: 'Error removing image', error: err });

            return res.status(200).json({ message: 'Profile image deleted successfully' });
        });
    });
});

module.exports = router;