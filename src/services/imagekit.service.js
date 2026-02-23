const imagekit = require('../config/imagekit');

const uploadImage = async (fileBuffer, userId) => {
    const uploadResponse = await imagekit.upload({
        file: fileBuffer,
        fileName: `user_${userId}_${Date.now()}`,
        folder: '/coloors/profiles'
    });
    return uploadResponse;
};

const deleteImage = async (fileId) => {
    return await imagekit.deleteFile(fileId);
};

module.exports = { uploadImage, deleteImage };