const transporter = require('../config/mail');
require('dotenv').config();

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpEmail = (toEmail, otp) => {
    const mailOptions = {
        from: `"Coloors App" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: 'Your OTP for Login',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333;">Coloors Login OTP</h2>
                <p>Your One-Time Password is:</p>
                <h1 style="color: #4CAF50; letter-spacing: 8px; font-size: 40px;">${otp}</h1>
                <p>Valid for <b>5 minutes</b>.</p>
                <p style="color: red;">If you did not request this, ignore this email.</p>
            </div>
        `
    };
    return transporter.sendMail(mailOptions);
};

const sendResetOtpEmail = (toEmail, otp) => {
    const mailOptions = {
        from: `"Coloors App" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: 'Password Reset OTP',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>Your OTP to reset your password is:</p>
                <h1 style="color: #e74c3c; letter-spacing: 8px; font-size: 40px;">${otp}</h1>
                <p>Valid for <b>5 minutes</b>.</p>
                <p style="color: red;">If you did not request this, ignore this email.</p>
            </div>
        `
    };
    return transporter.sendMail(mailOptions);
};

module.exports = { generateOtp, sendOtpEmail, sendResetOtpEmail };