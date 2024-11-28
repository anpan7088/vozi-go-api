import pkg from 'jsonwebtoken'; // Import the entire jsonwebtoken package
const { sign } = pkg; // Destructure the 'sign' function

import bcrypt from 'bcrypt'; // Import bcrypt for password hashing
import { pool } from '../db/db.mjs'; // Adjust the path to the db module

const usersTable = process.env.USERS_TABLE || 'users';
const secretKey = process.env.JWT_SECRET_KEY || 'defaultSecretKey-eohfufiufrei';
const expiration = Number(process.env.JWT_EXPIRATION) || 3600;
const saltRounds = 10; // Define the number of salt rounds for bcrypt

const responseTokenGenerator = (result) => {
    const { id, username, fullName, role } = result; // Decompose the result object
    const user_id = id;
    // Create a payload object with the user's ID, username, and role
    const payload = { user_id, username, role };
    const token = sign(payload, secretKey, { expiresIn: expiration });

    return {
        message: 'JWT Token Generated Successfully',
        id: user_id,
        user_id,
        userName: username,
        fullName,
        role,
        token,
        expiresIn: expiration
    };
};

// registerUser function, inserting user data into the database
export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // SQL query to insert user data into the database
        const sql = `INSERT INTO ${usersTable} (username, email, password) VALUES (?, ?, ?)`;

        // Execute the SQL query with the provided values
        await pool.promise().query(sql, [username, email, hashedPassword]);
        res.status(200).json({ message: "Registered Successfully" });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// loginUser function, checking username and verifying the hashed password
export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    // SQL query to fetch user data from the database
    const sql = `SELECT id, username, password, role,
                    CONCAT(COALESCE(firstName, ''), ' ', COALESCE(lastName, '')) as fullName
                FROM ${usersTable} WHERE username = ?`;

    try {
        const [result] = await pool.promise().query(sql, [username]);

        if (result.length > 0) {
            const user = result[0];

            // Verify the password
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // Call the responseTokenGenerator function to generate the response object
                res.json(responseTokenGenerator(user));
            } else {
                // If the password doesn't match, return an error
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            // If no user is found, return an error
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        // If some other error occurs, return a generic error message
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
// loginUser function, checking username and password and generating JWT token
export const loginUser2 = async (req, res) => {
    const { username, password } = req.body;

    // SQL query to fetch user data from the database
    const sql = `SELECT id, username, role,
                    CONCAT(COALESCE(firstName, ''), ' ', COALESCE(lastName, '')) as fullName
                FROM ${usersTable} WHERE username = ? AND password = ?`;

    try {
        const [result] = await pool.promise().query(sql, [username, password]);
        if (result.length > 0) {
            // Call the responseTokenGenerator function to generate the response object
            res.json(responseTokenGenerator(result[0]));
        } else {
            // If no user is found, return an error
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        // If some other error occurs, return a generic error message
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Default export of registerUser and loginUser functions
export default {
    registerUser,
    loginUser,
};
