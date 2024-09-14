// user/controllers.js
const { pool } = require('../db/db'); // Adjust the path to the db module
const usersTable = process.env.USERS_TABLE || 'users';

// get current user profile
const getUserProfile = async (req, res) => {

    // Get user_id from query parameters if present, otherwise use req.user.id
    const userId = req.params.user_id || req.user.id;

    const sql = `SELECT * FROM ${usersTable} WHERE id = ?`;

    try {
        const [results] = await pool.promise().query(sql, [userId]);
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: 'UserID not found', userId });
        }
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            sqlError: err.sqlMessage
        });
    }
};

// list all users
const listAllUsers = async (req, res) => {

    // select all users with review count
    const sql = `
        SELECT u.*
        FROM ${usersTable} u
        GROUP BY u.id;
    `;

    try {
        const [results] = await pool.promise().query(sql);
        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ error: 'No one is found!' });
        }
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            sqlError: err.sqlMessage
        });
    }
};

// PATCH CURRENT USER PROFILE
const patchUserProfile = async (req, res) => {

    // Get user_id from query parameters if present, otherwise use req.user.id
    const userId = req.params.user_id || req.user.id;
    const fieldsToUpdate = req.body;

    // empty list to store the fields to update
    let updateFields = [];
    let updateValues = [];

    // Loop through the fields to update and build the SQL query
    for (const field in fieldsToUpdate) {
        updateFields.push(`${field} = ?`);
        updateValues.push(fieldsToUpdate[field]);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(userId);

    // Construct the SQL query, from the list of fields to update
    const sql = `UPDATE ${usersTable} SET ${updateFields.join(", ")} WHERE id = ?`;

    // Execute the SQL query
    try {
        await pool.promise().query(sql, updateValues);
        res.json({
            status: true,
            message: 'Profile updated successfully',
            values: fieldsToUpdate
        });
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            sqlError: err.sqlMessage
        });
    }
};

const deleteUserProfile = async (req, res) => {
    const userId = req.params.user_id;
    const sql = `DELETE FROM ${usersTable} WHERE id = ?`;
    try {
        await pool.promise().query(sql, [userId]);
        res.json({
            status: true,
            message: 'Profile deleted successfully'
        });
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            sqlError: err.sqlMessage
        });
    }
};

// EXPORT
module.exports = {
    getUserProfile,
    listAllUsers,
    patchUserProfile,
    deleteUserProfile
};
