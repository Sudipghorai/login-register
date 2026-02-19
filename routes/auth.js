const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const sendOtpEmail = require('../utils/sendOtp');
require('dotenv').config();

// ✅ REGISTER
router.post('/register', (req, res) => {
    const { firstname, lastname, email, password, mobilenumber } = req.body;

    if (!firstname || !lastname || !email || !password || !mobilenumber) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const checkEmail = 'SELECT * FROM users1 WHERE email = ?';
    db.query(checkEmail, [email], (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err });

        if (result.length > 0) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ message: 'Error hashing password' });

            const insertQuery = `
                INSERT INTO users1 (firstname, lastname, email, password, mobilenumber)
                VALUES (?, ?, ?, ?, ?)
            `;
            db.query(insertQuery, [firstname, lastname, email, hashedPassword, mobilenumber], (err, result) => {
                if (err) return res.status(500).json({ message: 'Error registering user', error: err });

                return res.status(201).json({
                    message: 'User registered successfully',
                    userId: result.insertId
                });
            });
        });
    });
});

// ✅ NORMAL LOGIN
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const query = 'SELECT * FROM users1 WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err });

        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error comparing password' });

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userid: user.userid, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    userid: user.userid,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    mobilenumber: user.mobilenumber
                }
            });
        });
    });
});

// ✅ STEP 1 - SEND OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const checkUser = 'SELECT * FROM users1 WHERE email = ?';
    db.query(checkUser, [email], async (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err });

        if (result.length === 0) {
            return res.status(404).json({ message: 'No account found with this email' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete old OTPs for this email
        const deleteOld = 'DELETE FROM users1_otp WHERE email = ?';
        db.query(deleteOld, [email], async (err) => {
            if (err) return res.status(500).json({ message: 'Server error', error: err });

            // ✅ Use MySQL NOW() to avoid timezone issues
            const insertOtp = `
                INSERT INTO users1_otp (email, otp, expires_at) 
                VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))
            `;
            db.query(insertOtp, [email, otp], async (err) => {
                if (err) return res.status(500).json({ message: 'Error saving OTP', error: err });

                try {
                    await sendOtpEmail(email, otp);
                    return res.status(200).json({ message: 'OTP sent to your email successfully' });
                } catch (emailErr) {
                    console.error('Email error:', emailErr.message);
                    return res.status(500).json({ message: 'Failed to send OTP email', error: emailErr.message });
                }
            });
        });
    });
});

// ✅ STEP 2 - VERIFY OTP & LOGIN
router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // ✅ Let MySQL handle time comparison using NOW()
    const checkOtp = `
        SELECT * FROM users1_otp 
        WHERE email = ? AND otp = ? AND expires_at > NOW()
    `;
    db.query(checkOtp, [email, otp], (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err });

        if (result.length === 0) {
            return res.status(401).json({ message: 'Invalid OTP or OTP has expired. Please request a new one.' });
        }

        // Delete OTP after use
        const deleteOtp = 'DELETE FROM users1_otp WHERE email = ?';
        db.query(deleteOtp, [email], (err) => {
            if (err) console.error('Delete OTP error:', err);
        });

        // Get user details
        const getUser = 'SELECT * FROM users1 WHERE email = ?';
        db.query(getUser, [email], (err, userResult) => {
            if (err) return res.status(500).json({ message: 'Server error', error: err });

            const user = userResult[0];

            const token = jwt.sign(
                { userid: user.userid, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.status(200).json({
                message: 'OTP verified! Login successful ✅',
                token,
                user: {
                    userid: user.userid,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    mobilenumber: user.mobilenumber
                }
            });
        });
    });
});

module.exports = router;