const db = require('../config/db');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { generateOtp, sendOtpEmail, sendResetOtpEmail } = require('./otp.service');

// Register
const register = (firstname, lastname, email, password, mobilenumber) => {
    return new Promise((resolve, reject) => {
        const checkEmail = 'SELECT * FROM users1 WHERE email = ?';
        db.query(checkEmail, [email], (err, result) => {
            if (err) return reject(err);
            if (result.length > 0) return reject({ status: 409, message: 'Email already registered' });

            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) return reject(err);

                const insertQuery = `INSERT INTO users1 (firstname, lastname, email, password, mobilenumber) VALUES (?, ?, ?, ?, ?)`;
                db.query(insertQuery, [firstname, lastname, email, hashedPassword, mobilenumber], (err, result) => {
                    if (err) return reject(err);
                    resolve(result.insertId);
                });
            });
        });
    });
};

// Normal Login
const login = (email, password) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users1 WHERE email = ?';
        db.query(query, [email], (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject({ status: 404, message: 'User not found' });

            const user = result[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) return reject(err);
                if (!isMatch) return reject({ status: 401, message: 'Invalid credentials' });

                const token = generateToken({ userid: user.userid, email: user.email });
                resolve({ token, user: { userid: user.userid, firstname: user.firstname, lastname: user.lastname, email: user.email, mobilenumber: user.mobilenumber } });
            });
        });
    });
};

// Send OTP
const sendOtp = (email) => {
    return new Promise((resolve, reject) => {
        const checkUser = 'SELECT * FROM users1 WHERE email = ?';
        db.query(checkUser, [email], async (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject({ status: 404, message: 'No account found with this email' });

            const otp = generateOtp();

            const deleteOld = 'DELETE FROM users1_otp WHERE email = ?';
            db.query(deleteOld, [email], async (err) => {
                if (err) return reject(err);

                const insertOtp = `INSERT INTO users1_otp (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))`;
                db.query(insertOtp, [email, otp], async (err) => {
                    if (err) return reject(err);
                    try {
                        await sendOtpEmail(email, otp);
                        resolve('OTP sent successfully');
                    } catch (emailErr) {
                        reject({ status: 500, message: 'Failed to send OTP email' });
                    }
                });
            });
        });
    });
};

// Verify OTP
const verifyOtp = (email, otp) => {
    return new Promise((resolve, reject) => {
        const checkOtp = `SELECT * FROM users1_otp WHERE email = ? AND otp = ? AND expires_at > NOW()`;
        db.query(checkOtp, [email, otp], (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject({ status: 401, message: 'Invalid OTP or OTP has expired' });

            const deleteOtp = 'DELETE FROM users1_otp WHERE email = ?';
            db.query(deleteOtp, [email], (err) => { if (err) console.error(err); });

            const getUser = 'SELECT * FROM users1 WHERE email = ?';
            db.query(getUser, [email], (err, userResult) => {
                if (err) return reject(err);
                const user = userResult[0];
                const token = generateToken({ userid: user.userid, email: user.email });
                resolve({ token, user: { userid: user.userid, firstname: user.firstname, lastname: user.lastname, email: user.email, mobilenumber: user.mobilenumber } });
            });
        });
    });
};

// Forgot Password - Send OTP
const forgotPassword = (email) => {
    return new Promise((resolve, reject) => {
        const checkUser = 'SELECT * FROM users1 WHERE email = ?';
        db.query(checkUser, [email], async (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject({ status: 404, message: 'No account found with this email' });

            const otp = generateOtp();
            const deleteOld = 'DELETE FROM password_reset WHERE email = ?';
            db.query(deleteOld, [email], async (err) => {
                if (err) return reject(err);

                const insertOtp = `INSERT INTO password_reset (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))`;
                db.query(insertOtp, [email, otp], async (err) => {
                    if (err) return reject(err);
                    try {
                        await sendResetOtpEmail(email, otp);
                        resolve('Password reset OTP sent');
                    } catch (emailErr) {
                        reject({ status: 500, message: 'Failed to send OTP email' });
                    }
                });
            });
        });
    });
};

// Verify Reset OTP
const verifyResetOtp = (email, otp) => {
    return new Promise((resolve, reject) => {
        const checkOtp = `SELECT * FROM password_reset WHERE email = ? AND otp = ? AND expires_at > NOW()`;
        db.query(checkOtp, [email, otp], (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject({ status: 401, message: 'Invalid OTP or OTP has expired' });

            const markVerified = 'UPDATE password_reset SET is_verified = 1 WHERE email = ?';
            db.query(markVerified, [email], (err) => {
                if (err) return reject(err);
                resolve('OTP verified successfully');
            });
        });
    });
};

// Reset Password
const resetPassword = (email, newpassword) => {
    return new Promise((resolve, reject) => {
        const checkVerified = 'SELECT * FROM password_reset WHERE email = ? AND is_verified = 1';
        db.query(checkVerified, [email], (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject({ status: 403, message: 'OTP not verified. Please verify your OTP first.' });

            bcrypt.hash(newpassword, 10, (err, hashedPassword) => {
                if (err) return reject(err);

                const updatePassword = 'UPDATE users1 SET password = ? WHERE email = ?';
                db.query(updatePassword, [hashedPassword, email], (err) => {
                    if (err) return reject(err);

                    const deleteOtp = 'DELETE FROM password_reset WHERE email = ?';
                    db.query(deleteOtp, [email], (err) => { if (err) console.error(err); });

                    resolve('Password reset successfully');
                });
            });
        });
    });
};

module.exports = { register, login, sendOtp, verifyOtp, forgotPassword, verifyResetOtp, resetPassword };