// middleware/authMiddleware.js
// Import necessary modules using ES Modules syntax
import { pool } from '../db/db.mjs';
import jwt from 'jsonwebtoken';

// Secret key for JWT
const secretKey = process.env.JWT_SECRET_KEY || 'defaultSecretKey-eohfufiufrei';

// isUser middleware, assuming user_id is stored in the token payload
export const isUser = (req, res, next) => {
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
export const isProfileOwner = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the Authorization header
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, secretKey); // Use your secret key from environment variables
        const userIdFromToken = decoded.user_id; // Assume the token payload includes the user ID as 'id'
        const userIdFromRequest = Number(req.params.user_id); // || req.body.user_id; // User ID from request (e.g., from URL or body)

        if (!userIdFromRequest) {
            return res.status(400).json({ error: 'Bad Request: No user_id provided' });
        }
        if (userIdFromToken === userIdFromRequest) {
            return next(); // User is authorized, proceed to the next middleware/controller
        }
        return res.status(403).json({ error: 'Forbidden: You do not own this profile' });

    } catch (error) {
        console.error("Error in isProfileOwner middleware:", error);
        res.status(401).json({
            error: 'Unauthorized: Invalid token',
            details: error.message
        });
    }
};

// isAdmin middleware, assuming admin role is 'admin' and role is stored in the token payload
export const isAdmin = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], secretKey);
        console.log('Decoded token:', decoded);
        req.user = decoded; // Assuming the token payload contains the user object with username and role

        if (req.user && ( req.user.role === 'admin' || req.user.role === 'root' )) {
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
export const isAdminOrOwner = async (req, res, next) => {
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
