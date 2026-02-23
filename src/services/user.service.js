const db = require('../config/db');
const { uploadImage, deleteImage } = require('./imagekit.service');

// Get User
const getUser = (userid) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT userid, firstname, lastname, email, mobilenumber, profile_image FROM users1 WHERE userid = ?`;
        db.query(query, [userid], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return reject({ status: 404, message: 'User not found' });
            resolve(results[0]);
        });
    });
};

// Upload Image
const uploadProfileImage = (userid, fileBuffer) => {
    return new Promise(async (resolve, reject) => {
        try {
            const getOldImage = 'SELECT imagekit_file_id FROM users1 WHERE userid = ?';
            db.query(getOldImage, [userid], async (err, result) => {
                if (err) return reject(err);

                if (result[0] && result[0].imagekit_file_id) {
                    try { await deleteImage(result[0].imagekit_file_id); } catch (e) { console.error(e); }
                }

                const uploadResponse = await uploadImage(fileBuffer, userid);

                const updateImage = 'UPDATE users1 SET profile_image = ?, imagekit_file_id = ? WHERE userid = ?';
                db.query(updateImage, [uploadResponse.url, uploadResponse.fileId, userid], (err) => {
                    if (err) return reject(err);
                    resolve(uploadResponse.url);
                });
            });
        } catch (err) {
            reject(err);
        }
    });
};

// Edit User
const editUser = (userid, firstname, lastname, email, mobilenumber, fileBuffer = null) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (fileBuffer) {
                const getOldImage = 'SELECT imagekit_file_id FROM users1 WHERE userid = ?';
                db.query(getOldImage, [userid], async (err, result) => {
                    if (err) return reject(err);

                    if (result[0] && result[0].imagekit_file_id) {
                        try { await deleteImage(result[0].imagekit_file_id); } catch (e) { console.error(e); }
                    }

                    const uploadResponse = await uploadImage(fileBuffer, userid);

                    const updateQuery = `UPDATE users1 SET firstname=?, lastname=?, email=?, mobilenumber=?, profile_image=?, imagekit_file_id=? WHERE userid=?`;
                    db.query(updateQuery, [firstname, lastname, email, mobilenumber, uploadResponse.url, uploadResponse.fileId, userid], (err) => {
                        if (err) return reject(err);
                        resolve({ firstname, lastname, email, mobilenumber, profile_image: uploadResponse.url });
                    });
                });
            } else {
                const updateQuery = `UPDATE users1 SET firstname=?, lastname=?, email=?, mobilenumber=? WHERE userid=?`;
                db.query(updateQuery, [firstname, lastname, email, mobilenumber, userid], (err) => {
                    if (err) return reject(err);
                    resolve({ firstname, lastname, email, mobilenumber });
                });
            }
        } catch (err) {
            reject(err);
        }
    });
};

// Delete Image
const deleteProfileImage = (userid) => {
    return new Promise(async (resolve, reject) => {
        const getImage = 'SELECT imagekit_file_id FROM users1 WHERE userid = ?';
        db.query(getImage, [userid], async (err, result) => {
            if (err) return reject(err);
            if (!result[0] || !result[0].imagekit_file_id) return reject({ status: 404, message: 'No profile image found' });

            try {
                await deleteImage(result[0].imagekit_file_id);
                const removeImage = 'UPDATE users1 SET profile_image = NULL, imagekit_file_id = NULL WHERE userid = ?';
                db.query(removeImage, [userid], (err) => {
                    if (err) return reject(err);
                    resolve('Profile image deleted successfully');
                });
            } catch (err) {
                reject(err);
            }
        });
    });
};

module.exports = { getUser, uploadProfileImage, editUser, deleteProfileImage };