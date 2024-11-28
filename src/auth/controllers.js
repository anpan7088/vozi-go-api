import pkg from 'jsonwebtoken'; // Import the entire jsonwebtoken package
const { sign } = pkg; // Destructure the 'sign' function

import bcrypt from 'bcrypt'; // Import bcrypt for password hashing
// import nodemailer from 'nodemailer'; // For sending emails
import Mailjet from 'node-mailjet';

import crypto from 'crypto';

import { pool } from '../db/db.mjs'; // Adjust the path to the db module

const usersTable = process.env.USERS_TABLE || 'users';
const secretKey = process.env.JWT_SECRET_KEY || 'defaultSecretKey-eohfufiufrei';
const expiration = Number(process.env.JWT_EXPIRATION) || 3600;
const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000'; // Adjust the base URL of your app

const resetTable = process.env.RESET_TABLE || 'password_resets';
const resetTokenExpiration = Number(process.env.RESET_TOKEN_EXPIRATION) || 3600; // 1 hour

const mailjetClient = Mailjet.apiConnect(  process.env.API_KEY,  process.env.API_SECRET);

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

// Change Password Function
export const passwordChange = async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    try {
        // Fetch the user's current hashed password from the database
        const sqlFetchPassword = `SELECT password FROM ${usersTable} WHERE id = ?`;
        const [result] = await pool.promise().query(sqlFetchPassword, [userId]);

        if (result.length === 0) {
            // If no user is found, return an error
            return res.status(404).json({ error: 'User not found' });
        }

        const { password: currentHashedPassword } = result[0];

        // Compare the provided old password with the current hashed password
        const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);
        if (!isMatch) {
            // If the old password doesn't match, return an error
            return res.status(401).json({ error: 'Old password is incorrect' });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update the user's password in the database
        const sqlUpdatePassword = `UPDATE ${usersTable} SET password = ? WHERE id = ?`;
        await pool.promise().query(sqlUpdatePassword, [hashedNewPassword, userId]);

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Error in changePassword:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const resetPassword = async (req, res) => {
    const { token, userId, newPassword } = req.body;

    try {
        console.log('Received resetPassword request:', req.body);
        // Hash the received token for secure comparison
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Check if the token exists and is valid
        const sqlFetchToken = `
            SELECT user_id, expires_at 
            FROM ${resetTable} 
            WHERE token = ? AND user_id = ? AND expires_at > NOW()`;
        const [tokens] = await pool.promise().query(sqlFetchToken, [hashedToken, userId]);

        if (tokens.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        const sqlUpdatePassword = `UPDATE ${usersTable} SET password = ? WHERE id = ?`;
        await pool.promise().query(sqlUpdatePassword, [hashedPassword, userId]);

        // Remove the token from the database
        const sqlDeleteToken = `DELETE FROM ${resetTable} WHERE token = ?`;
        await pool.promise().query(sqlDeleteToken, [hashedToken]);

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const sendMail = async (username, email, resetLink) => {
    try {
        const result = await mailjetClient
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: {
                            Email: 'support@vozi-go.sman.cloud',
                            Name: 'VoziGo Support',
                        },
                        To: [
                            {
                                Email: email,
                                Name: username,
                            },
                        ],
                        Subject: 'Password Reset Link!',
                        TextPart: resetLink,
                        HTMLPart: `
                            <p>Hello ${username},</p>
                            <p>You requested a password reset. Click the link below to reset your password:</p>
                            <a href="${resetLink}">${resetLink}</a>
                            <p>If you did not request this, please ignore this email.</p>
                        `,
                    },
                ],
            });
        console.log('Email sent successfully:', result.body);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Function to generate and send the password reset link
export const sendPasswordResetLink = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the email exists in the database
        const sqlFetchUser = `SELECT id, username FROM ${usersTable} WHERE email = ?`;
        const [users] = await pool.promise().query(sqlFetchUser, [email]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }

        const { id: userId, username } = users[0];

        // Generate a secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date(Date.now() + resetTokenExpiration * 1000); // Expiration time

        // Store the hashed token and expiration in the database
        const sqlInsertToken = `
            INSERT INTO ${resetTable} (user_id, token, expires_at) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE token = ?, expires_at = ?`;
        await pool.promise().query(sqlInsertToken, [userId, hashedToken, expiresAt, hashedToken, expiresAt]);

        // Create a password reset link
        const resetLink = `${appBaseUrl}/reset-password?token=${resetToken}&userId=${userId}`;

        // Sending mail
        sendMail(username, email, resetLink);

        res.status(200).json({ message: 'Password reset link sent successfully' });
    } catch (err) {
        console.error('Error sending password reset link:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Default export of registerUser and loginUser functions
export default {
    registerUser,
    loginUser,
    passwordChange,
    resetPassword,
    sendPasswordResetLink,
};


// API key: c4266a882d0a75b0cd65cb6769f7cad4 
// Secret key: c1701974b2b0e78e90ada7ace47e5b3c