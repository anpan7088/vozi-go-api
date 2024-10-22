import pkg from 'jsonwebtoken'; // Import the entire jsonwebtoken package
const { sign } = pkg; // Destructure the 'sign' function

import { pool } from '../db/db.mjs'; // Adjust the path to the db module

const usersTable = process.env.USERS_TABLE || 'users';
const secretKey = process.env.JWT_SECRET_KEY || 'defaultSecretKey-eohfufiufrei';
const expiration = Number(process.env.JWT_EXPIRATION) || 3600; 

const responseTokenGenerator = (result) => {
    const { id, username, fullName, role } = result; // Decompose the result object

    // Create a payload object with the user's ID, username, and role
    const payload = { id, username, role };
    const token = sign(payload, secretKey, { expiresIn: expiration });

    return { 
        message: 'JWT Token Generated Successfully', 
        id, 
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

    // SQL query to insert user data into the database
    const sql = `INSERT INTO ${usersTable} (username, email, password) VALUES (?, ?, ?)`;
    console.log("SQL Query:", sql);

    try {
        // Execute the SQL query with the provided values
        await pool.promise().query(sql, [username, email, password]);
        res.status(200).json({ message: "Registered Successfully" });
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// loginUser function, checking username and password and generating JWT token
export const loginUser = async (req, res) => {
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
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Default export of registerUser and loginUser functions
export default {
    registerUser,
    loginUser,
};
