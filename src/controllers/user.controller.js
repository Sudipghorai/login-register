const userService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getUser = async (req, res) => {
    try {
        const user = await userService.getUser(req.user.userid);
        return successResponse(res, 200, 'User fetched successfully', { user });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const uploadImage = async (req, res) => {
    if (!req.files || !req.files.profile_image)
        return errorResponse(res, 400, 'No image uploaded');

    const file = req.files.profile_image;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype))
        return errorResponse(res, 400, 'Only images allowed (jpeg, jpg, png, webp)');

    try {
        const imageUrl = await userService.uploadProfileImage(req.user.userid, file.data);
        return successResponse(res, 200, 'Profile image uploaded successfully', { profile_image: imageUrl });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const editUser = async (req, res) => {
    const { firstname, lastname, email, mobilenumber } = req.body;
    if (!firstname || !lastname || !email || !mobilenumber)
        return errorResponse(res, 400, 'All fields are required');

    let fileBuffer = null;
    if (req.files && req.files.profile_image) {
        const file = req.files.profile_image;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype))
            return errorResponse(res, 400, 'Only images allowed (jpeg, jpg, png, webp)');
        fileBuffer = file.data;
    }

    try {
        const user = await userService.editUser(req.user.userid, firstname, lastname, email, mobilenumber, fileBuffer);
        return successResponse(res, 200, 'User updated successfully', { user });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const deleteImage = async (req, res) => {
    try {
        await userService.deleteProfileImage(req.user.userid);
        return successResponse(res, 200, 'Profile image deleted successfully');
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

module.exports = { getUser, uploadImage, editUser, deleteImage };