// middleware/authMiddleware.js
const { pool } = require('../db/db');
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET_KEY || 'defaultSecretKey-eohfufiufrei';

// isUser middleware, assuming user_id is stored in the token payload
const isUser = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    jwt.verify(token.split(' ')[1], secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        req.user = user;
        next();
    });
};

// isOwner middleware, assuming user_id is stored in the token payload
const isOwner = async (req, res, next) => {
    const reviewToDel = req.params.id;
    try {
        const [result] = await pool.promise().query('SELECT user_id FROM dorms_review WHERE id = ?', [reviewToDel]);
        if (result.length > 0 && result[0].user_id === req.user.id) {
            next();
        } else {
            res.status(403).json({ error: 'Forbidden: You are not the owner of this review' });
        }
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// isAdmin middleware, assuming admin role is 'admin' and role is stored in the token payload
const isAdmin = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], secretKey);
        console.log('Decoded token:', decoded);
        req.user = decoded; // Assuming the token payload contains the user object with username and role

        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ error: 'Forbidden: Admins only' });
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

// isAdminOrOwner middleware, assuming admin role is 'admin' and role is stored in the token payload
const isAdminOrOwner = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], secretKey);
        req.user = decoded; // Assuming the token payload contains the user object with username and role

        if (req.user && req.user.role === 'admin') {
            return next();
        } else {
            const reviewToDel = req.params.id;
            const [result] = await pool.promise().query('SELECT user_id FROM dorms_review WHERE id = ?', [reviewToDel]);
            if (result.length > 0 && result[0].user_id === req.user.id) {
                return next();
            } else {
                return res.status(403).json({ error: 'Forbidden: Admins or Owners only' });
            }
        }
    } catch (error) {
        console.error('Error verifying token or querying database:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = { isUser, isAdmin, isOwner, isAdminOrOwner };
