// Import necessary modules using ES module syntax
import express from 'express';
import { isUser, isAdmin, isProfileOwner, isAdminOrOwner } from '../middleware/authMiddleware.js'; // Ensure the .js extension
import { getUserProfile, listAllUsers, patchUserProfile, deleteUserProfile } from './controllers.js'; // Ensure the .js extension

const router = express.Router();

// Define the routes using the imported middleware and controllers
router.get("/profile/:user_id?", isUser, isProfileOwner, getUserProfile);
router.get("/listAll", isUser, listAllUsers);  // Old route kept for compatibility
router.get("/profilesAll", isUser, listAllUsers);
router.patch('/profile/:user_id?', isUser, isProfileOwner, patchUserProfile);
router.delete('/profile/:user_id', isAdminOrOwner, deleteUserProfile);

// Export the router using ES module syntax
export default router;
 