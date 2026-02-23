const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const imagekit = require('../utils/imagekit');
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

        return res.status(200).json({
            message: 'User fetched successfully',
            user: results[0]
        });
    });
});

// ✅ UPLOAD PROFILE IMAGE ONLY
router.post('/upload-image', authMiddleware, async (req, res) => {
    if (!req.files || !req.files.profile_image) {
        return res.status(400).json({ message: 'No image uploaded' });
    }

    const file = req.files.profile_image;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ message: 'Only images allowed (jpeg, jpg, png, webp)' });
    }

    try {
        // Get old image to delete
        const getOldImage = 'SELECT imagekit_file_id FROM users1 WHERE userid = ?';
        db.query(getOldImage, [req.user.userid], async (err, result) => {
            if (err) return res.status(500).json({ message: 'Server error', error: err });

            // Delete old image from ImageKit
            if (result[0] && result[0].imagekit_file_id) {
                try {
                    await imagekit.deleteFile(result[0].imagekit_file_id);
                } catch (deleteErr) {
                    console.error('Error deleting old image:', deleteErr.message);
                }
            }

            // Upload to ImageKit
            const uploadResponse = await imagekit.upload({
                file: file.data,
                fileName: `user_${req.user.userid}_${Date.now()}`,
                folder: '/coloors/profiles'
            });

            // Save to DB
            const updateImage = 'UPDATE users1 SET profile_image = ?, imagekit_file_id = ? WHERE userid = ?';
            db.query(updateImage, [uploadResponse.url, uploadResponse.fileId, req.user.userid], (err) => {
                if (err) return res.status(500).json({ message: 'Error saving image', error: err });

                return res.status(200).json({
                    message: 'Profile image uploaded successfully',
                    profile_image: uploadResponse.url
                });
            });
        });
    } catch (err) {
        return res.status(500).json({ message: 'ImageKit upload failed', error: err.message });
    }
});

// ✅ EDIT USER PROFILE (with optional image)
router.put('/edit', authMiddleware, async (req, res) => {
    const { firstname, lastname, email, mobilenumber } = req.body;

    if (!firstname || !lastname || !email || !mobilenumber) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        if (req.files && req.files.profile_image) {
            const file = req.files.profile_image;

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.mimetype)) {
                return res.status(400).json({ message: 'Only images allowed (jpeg, jpg, png, webp)' });
            }

            // Get old image
            const getOldImage = 'SELECT imagekit_file_id FROM users1 WHERE userid = ?';
            db.query(getOldImage, [req.user.userid], async (err, result) => {
                if (err) return res.status(500).json({ message: 'Server error', error: err });

                // Delete old image from ImageKit
                if (result[0] && result[0].imagekit_file_id) {
                    try {
                        await imagekit.deleteFile(result[0].imagekit_file_id);
                    } catch (deleteErr) {
                        console.error('Error deleting old image:', deleteErr.message);
                    }
                }

                // Upload new image
                const uploadResponse = await imagekit.upload({
                    file: file.data,
                    fileName: `user_${req.user.userid}_${Date.now()}`,
                    folder: '/coloors/profiles'
                });

                // Update all fields with image
                const updateQuery = `
                    UPDATE users1 
                    SET firstname=?, lastname=?, email=?, mobilenumber=?, profile_image=?, imagekit_file_id=?
                    WHERE userid=?
                `;
                db.query(updateQuery, [firstname, lastname, email, mobilenumber, uploadResponse.url, uploadResponse.fileId, req.user.userid], (err) => {
                    if (err) return res.status(500).json({ message: 'Error updating user', error: err });

                    return res.status(200).json({
                        message: 'User updated successfully',
                        user: {
                            firstname, lastname, email, mobilenumber,
                            profile_image: uploadResponse.url
                        }
                    });
                });
            });

        } else {
            // Update without image
            const updateQuery = `
                UPDATE users1 
                SET firstname=?, lastname=?, email=?, mobilenumber=?
                WHERE userid=?
            `;
            db.query(updateQuery, [firstname, lastname, email, mobilenumber, req.user.userid], (err) => {
                if (err) return res.status(500).json({ message: 'Error updating user', error: err });

                return res.status(200).json({
                    message: 'User updated successfully',
                    user: { firstname, lastname, email, mobilenumber }
                });
            });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Error updating user', error: err.message });
    }
});

// ✅ DELETE PROFILE IMAGE
router.delete('/delete-image', authMiddleware, async (req, res) => {
    const getImage = 'SELECT imagekit_file_id FROM users1 WHERE userid = ?';
    db.query(getImage, [req.user.userid], async (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err });

        if (!result[0] || !result[0].imagekit_file_id) {
            return res.status(404).json({ message: 'No profile image found' });
        }

        try {
            await imagekit.deleteFile(result[0].imagekit_file_id);

            const removeImage = 'UPDATE users1 SET profile_image = NULL, imagekit_file_id = NULL WHERE userid = ?';
            db.query(removeImage, [req.user.userid], (err) => {
                if (err) return res.status(500).json({ message: 'Error removing image', error: err });

                return res.status(200).json({ message: 'Profile image deleted successfully' });
            });
        } catch (err) {
            return res.status(500).json({ message: 'Error deleting from ImageKit', error: err.message });
        }
    });
});

module.exports = router;