import { pool } from '../db/db.mjs'; // Adjust the path to the db module
const usersTable = process.env.USERS_TABLE || 'users';
// import jwt from 'jsonwebtoken';

// Get current user profile
export const getUserProfile = async (req, res) => {
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
            sqlError: err.sqlMessage,
            tKey: 'InternalServerError'
        });
    }
};

// Check if user name exists
export const checkUserExists = async (req, res) => {
    const userId = req.params.username;
    const sql = `SELECT * FROM ${usersTable} WHERE username = ?`;
    try {
        const [results] = await pool.promise().query(sql, [userId]);
        if (results.length > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            sqlError: err.sqlMessage,
            tKey: 'InternalServerError'
        });
    }
};

// Check if email exists
export const checkEmailExists = async (req, res) => {
    const email = req.params.email;
    const sql = `SELECT * FROM ${usersTable} WHERE email = ?`;
    try {
        const [results] = await pool.promise().query(sql, [email]);
        if (results.length > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            sqlError: err.sqlMessage,
            tKey: 'InternalServerError'
        });
    }
};


// List all users
export const listAllUsers = async (req, res) => {
    // Select all users with review count
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
            sqlError: err.sqlMessage,
            tKey: 'InternalServerError'
        });
    }
};

// PATCH CURRENT USER PROFILE
export const patchUserProfile = async (req, res) => {
    // Get user_id from query parameters if present, otherwise use req.user.id
    const userId = req.params.user_id || req.user.id;
    const fieldsToUpdate = req.body;
// console.log(fieldsToUpdate);
    // Empty list to store the fields to update
    let updateFields = [];
    let updateValues = [];

    // Loop through the fields to update and build the SQL query
    for (const field in fieldsToUpdate) {
        updateFields.push(`${field} = ?`);
        updateValues.push(fieldsToUpdate[field]);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ 
            error: 'No fields to update', 
            tKey: 'NoFieldsToUpdate' 
        });
    }

    updateValues.push(userId);

    // Construct the SQL query from the list of fields to update
    const sql = `UPDATE ${usersTable} SET ${updateFields.join(", ")} WHERE id = ?`;

    // Execute the SQL query
    try {
        await pool.promise().query(sql, updateValues);
        res.json({
            status: true,
            message: 'Profile updated successfully',
            values: fieldsToUpdate,
            tKey: 'PreofileUpdated'
        });
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            tKey: 'InternalServerError',
            sqlError: err.sqlMessage,
        });
    }
};

// Delete user profile
export const deleteUserProfile = async (req, res) => {
    const userId = req.params.user_id;
    const sql = `DELETE FROM ${usersTable} WHERE id = ?`;
    
    try {
        await pool.promise().query(sql, [userId]);
        res.json({
            status: true,
            message: 'Profile deleted successfully',
        });
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            tKey: 'InternalServerError',
            sqlError: err.sqlMessage,
        });
    }
};

// Secret key for JWT
const secretKey = process.env.JWT_SECRET_KEY || 'defaultSecretKey-eohfufiufrei';

// PATCH CURRENT USER PROFILE
export const promoteToDriver = async (req, res) => {
    // Get user_id from query parameters if present, otherwise use req.user.id
    const userId = req.params.user_id || req.user.id;
    const sql = `UPDATE ${usersTable} SET role = 'driver' WHERE id = ?`;
    try {
        await pool.promise().query(sql, [userId]);
        res.json({
            status: true,
            message: 'User promoted to driver successfully',
            tKey: 'UserPromotedToDriver'
        });
    } catch (err) {
        // console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            sqlError: err.sqlMessage,
            tKey: 'InternalServerError'
        });
    }
};
