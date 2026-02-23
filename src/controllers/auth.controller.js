const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const register = async (req, res) => {
    const { firstname, lastname, email, password, mobilenumber } = req.body;
    if (!firstname || !lastname || !email || !password || !mobilenumber)
        return errorResponse(res, 400, 'All fields are required');
    try {
        const userId = await authService.register(firstname, lastname, email, password, mobilenumber);
        return successResponse(res, 201, 'User registered successfully', { userId });
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return errorResponse(res, 400, 'Email and password are required');
    try {
        const data = await authService.login(email, password);
        return successResponse(res, 200, 'Login successful', data);
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, 'Email is required');
    try {
        await authService.sendOtp(email);
        return successResponse(res, 200, 'OTP sent to your email successfully');
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return errorResponse(res, 400, 'Email and OTP are required');
    try {
        const data = await authService.verifyOtp(email, otp);
        return successResponse(res, 200, 'OTP verified! Login successful', data);
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, 'Email is required');
    try {
        await authService.forgotPassword(email);
        return successResponse(res, 200, 'Password reset OTP sent to your email');
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const verifyResetOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return errorResponse(res, 400, 'Email and OTP are required');
    try {
        await authService.verifyResetOtp(email, otp);
        return successResponse(res, 200, 'OTP verified. Please reset your password now.');
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

const resetPassword = async (req, res) => {
    const { email, newpassword } = req.body;
    if (!email || !newpassword) return errorResponse(res, 400, 'Email and new password are required');
    if (newpassword.length < 6) return errorResponse(res, 400, 'Password must be at least 6 characters');
    try {
        await authService.resetPassword(email, newpassword);
        return successResponse(res, 200, 'Password reset successfully! You can now login.');
    } catch (err) {
        return errorResponse(res, err.status || 500, err.message || 'Server error');
    }
};

module.exports = { register, login, sendOtp, verifyOtp, forgotPassword, verifyResetOtp, resetPassword };