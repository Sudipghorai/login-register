const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log('Email connection error:', error.message);
    } else {
        console.log('Email server is ready ✅');
    }
});

const sendOtpEmail = (toEmail, otp) => {
    const mailOptions = {
        from: `"Coloors App" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: 'Your OTP for Login',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333;">Coloors Login OTP</h2>
                <p>Your One-Time Password (OTP) is:</p>
                <h1 style="color: #4CAF50; letter-spacing: 8px; font-size: 40px;">${otp}</h1>
                <p>This OTP is valid for <b>5 minutes</b>.</p>
                <p style="color: red;">If you did not request this, please ignore this email.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;