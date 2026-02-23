const adminService = require('../services/admin.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const register = async (req, res) => {
    const { firstname, lastname, email, password, secret_key } = req.body;
    if (!firstname || !lastname || !email || !password || !secret_key)
        return errorResponse(res, 400, 'All fields are required including secret_key');
    try {
        const adminId = await adminService.register(firstname, lastname, email, password, secret_key);
        return successResponse(res, 201, 'Admin registered successfully', { adminId });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return errorResponse(res, 400, 'Email and password are required');
    try {
        const data = await adminService.login(email, password);
        return successResponse(res, 200, 'Admin login successful', data);
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

// ✅ Send OTP
const sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, 'Email is required');
    try {
        await adminService.sendOtp(email);
        return successResponse(res, 200, 'OTP sent to your email successfully');
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

// ✅ Verify OTP
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return errorResponse(res, 400, 'Email and OTP are required');
    try {
        const data = await adminService.verifyOtp(email, otp);
        return successResponse(res, 200, 'OTP verified! Admin login successful', data);
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await adminService.getAllUsers();
        return successResponse(res, 200, 'Users fetched successfully', { users });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await adminService.getUserById(req.params.userid);
        return successResponse(res, 200, 'User fetched successfully', { user });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const addUser = async (req, res) => {
    const { firstname, lastname, email, password, mobilenumber } = req.body;
    if (!firstname || !lastname || !email || !password || !mobilenumber)
        return errorResponse(res, 400, 'All fields are required');
    try {
        const userId = await adminService.addUser(firstname, lastname, email, password, mobilenumber);
        return successResponse(res, 201, 'User added successfully', { userId });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const updateUser = async (req, res) => {
    const { firstname, lastname, email, mobilenumber } = req.body;
    if (!firstname || !lastname || !email || !mobilenumber)
        return errorResponse(res, 400, 'All fields are required');
    try {
        const user = await adminService.updateUser(req.params.userid, firstname, lastname, email, mobilenumber);
        return successResponse(res, 200, 'User updated successfully', { user });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const deleteUser = async (req, res) => {
    try {
        await adminService.deleteUser(req.params.userid);
        return successResponse(res, 200, 'User deleted successfully');
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

module.exports = { register, login, sendOtp, verifyOtp, getAllUsers, getUserById, addUser, updateUser, deleteUser };