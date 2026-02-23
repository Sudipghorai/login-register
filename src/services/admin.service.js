const db = require('../config/db');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { generateOtp, sendOtpEmail } = require('./otp.service');

const ADMIN_SECRET_KEY = 'ADMIN_2026';

// ✅ Register Admin
const register = (firstname, lastname, email, password, secret_key) => {
    return new Promise((resolve, reject) => {
        if (secret_key !== ADMIN_SECRET_KEY) {
            return reject({ status: 403, message: 'Invalid secret key. You are not authorized to register as admin.' });
        }

        const checkEmail = 'SELECT * FROM admin1 WHERE email = ?';
        db.query(checkEmail, [email], (err, result) => {
            if (err) return reject(err);
            if (result.length > 0) return reject({ status: 409, message: 'Email already registered' });

            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) return reject(err);

                const insertQuery = `INSERT INTO admin1 (firstname, lastname, email, password) VALUES (?, ?, ?, ?)`;
                db.query(insertQuery, [firstname, lastname, email, hashedPassword], (err, result) => {
                    if (err) return reject(err);
                    resolve(result.insertId);
                });
            });
        });
    });
};

// ✅ Normal Login
const login = (email, password) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM admin1 WHERE email = ?';
        db.query(query, [email], (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject({ status: 404, message: 'Admin not found' });

            const admin = result[0];
            bcrypt.compare(password, admin.password, (err, isMatch) => {
                if (err) return reject(err);
                if (!isMatch) return reject({ status: 401, message: 'Invalid credentials' });

                const token = generateToken({ adminid: admin.adminid, email: admin.email, role: 'admin' });
                resolve({
                    token,
                    admin: {
                        adminid: admin.adminid,
                        firstname: admin.firstname,
                        lastname: admin.lastname,
                        email: admin.email
                    }
                });
            });
        });
    });
};

// ✅ Send OTP
const sendOtp = (email) => {
    return new Promise((resolve, reject) => {
        const checkAdmin = 'SELECT * FROM admin1 WHERE email = ?';
        db.query(checkAdmin, [email], async (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject({ status: 404, message: 'No admin account found with this email' });

            const otp = generateOtp();

            const deleteOld = 'DELETE FROM admin1_otp WHERE email = ?';
            db.query(deleteOld, [email], async (err) => {
                if (err) return reject(err);

                const insertOtp = `INSERT INTO admin1_otp (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))`;
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

// ✅ Verify OTP
const verifyOtp = (email, otp) => {
    return new Promise((resolve, reject) => {
        const checkOtp = `SELECT * FROM admin1_otp WHERE email = ? AND otp = ? AND expires_at > NOW()`;
        db.query(checkOtp, [email, otp], (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject({ status: 401, message: 'Invalid OTP or OTP has expired' });

            const deleteOtp = 'DELETE FROM admin1_otp WHERE email = ?';
            db.query(deleteOtp, [email], (err) => { if (err) console.error(err); });

            const getAdmin = 'SELECT * FROM admin1 WHERE email = ?';
            db.query(getAdmin, [email], (err, adminResult) => {
                if (err) return reject(err);
                const admin = adminResult[0];
                const token = generateToken({ adminid: admin.adminid, email: admin.email, role: 'admin' });
                resolve({
                    token,
                    admin: {
                        adminid: admin.adminid,
                        firstname: admin.firstname,
                        lastname: admin.lastname,
                        email: admin.email
                    }
                });
            });
        });
    });
};

// ✅ Get All Users
const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        const query = `SELECT userid, firstname, lastname, email, mobilenumber, profile_image FROM users1`;
        db.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// ✅ Get Single User
const getUserById = (userid) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT userid, firstname, lastname, email, mobilenumber, profile_image FROM users1 WHERE userid = ?`;
        db.query(query, [userid], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return reject({ status: 404, message: 'User not found' });
            resolve(results[0]);
        });
    });
};

// ✅ Add User
const addUser = (firstname, lastname, email, password, mobilenumber) => {
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

// ✅ Update User
const updateUser = (userid, firstname, lastname, email, mobilenumber) => {
    return new Promise((resolve, reject) => {
        const checkUser = 'SELECT * FROM users1 WHERE userid = ?';
        db.query(checkUser, [userid], (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject({ status: 404, message: 'User not found' });

            const updateQuery = `UPDATE users1 SET firstname=?, lastname=?, email=?, mobilenumber=? WHERE userid=?`;
            db.query(updateQuery, [firstname, lastname, email, mobilenumber, userid], (err) => {
                if (err) return reject(err);
                resolve({ userid, firstname, lastname, email, mobilenumber });
            });
        });
    });
};

// ✅ Delete User
const deleteUser = (userid) => {
    return new Promise((resolve, reject) => {
        const checkUser = 'SELECT * FROM users1 WHERE userid = ?';
        db.query(checkUser, [userid], (err, result) => {
            if (err) return reject(err);
            if (result.length === 0) return reject({ status: 404, message: 'User not found' });

            const deleteQuery = 'DELETE FROM users1 WHERE userid = ?';
            db.query(deleteQuery, [userid], (err) => {
                if (err) return reject(err);
                resolve('User deleted successfully');
            });
        });
    });
};

module.exports = { register, login, sendOtp, verifyOtp, getAllUsers, getUserById, addUser, updateUser, deleteUser };