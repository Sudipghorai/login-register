const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
require('dotenv').config();

router.get('/', authMiddleware, (req, res) => {

    const query = `
        SELECT userid, firstname, lastname, email, mobilenumber 
        FROM users1 
        WHERE userid = ?
    `;

    db.query(query, [req.user.userid], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Error fetching user',
                error: err
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            message: 'User fetched successfully',
            user: results[0]
        });
    });
});

router.put('/edit', authMiddleware, (req, res) => {
    const { firstname, lastname, email, mobilenumber } = req.body;

    if (!firstname || !lastname || !email || !mobilenumber) {
        return res.status(400).json({
            message: 'All fields are required'
        });
    }

    const updateQuery = `
        UPDATE users1 
        SET firstname = ?, lastname = ?, email = ?, mobilenumber = ?
        WHERE userid = ?
    `;

    db.query(
        updateQuery,
        [firstname, lastname, email, mobilenumber, req.user.userid],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error updating user',
                    error: err
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                message: 'User updated successfully'
            });
        }
    );
});

module.exports = router;