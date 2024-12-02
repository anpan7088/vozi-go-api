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
        // console.log('Decoded token:', decoded);
        req.user = decoded; // Assuming the token payload contains the user object with username and role

        if (req.user && ( req.user.role === 'admin' || req.user.role === 'root' )) {
            next();
        } else {
            res.status(403).json({ error: 'Forbidden: Admins only' });
        }
    } catch (error) {
        // console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

// isOwnerOrAdmin middleware, assuming user_id and role are stored in the token payload
// and user_id is provided in the request parameters
export const isOwnerOrAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ 
            error: 'Unauthorized: No token provided',
            tkey: 'UnauthorizedNoToken'
         });
    };
    try {
        const decoded = jwt.verify(token, secretKey);
        const userIdFromRequest = Number(req.params.user_id);
        if (!userIdFromRequest) {
            return res.status(400).json({ 
                error: 'Bad Request: No user_id provided',
                tkey: 'BadRequestNoUserId'
             });
        }
        if ( decoded.user_id === userIdFromRequest || decoded.role === 'admin') {
            return next();
        }
        return res.status(403).json({ 
            error: 'Forbidden: You do not own this profile', 
            tKey: 'ForbiddenNotOwnerOrAdmin'
         });
    } catch (error) {
        // console.error("Error in isProfileOwnerOrAdmin middleware:", error);
        res.status(401).json({
            error: 'Unauthorized: Invalid token',
            details: error.message,
            tKey: 'UnauthorizedInvalidToken'
        });
    }
};

// "decoded": {
//     "user_id": 1,
//     "username": "root",
//     "role": "admin",
//     "iat": 1733135078,
//     "exp": 1733156678
// } 
