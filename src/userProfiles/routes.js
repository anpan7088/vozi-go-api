// Import necessary modules using ES module syntax
import express from 'express';
import { isUser, isProfileOwner, isOwnerOrAdmin } from '../middleware/authMiddleware.js'; // Ensure the .js extension
import { getUserProfile, listAllUsers, patchUserProfile, deleteUserProfile, promoteToDriver } from './controllers.js'; // Ensure the .js extension

const router = express.Router();

// Define the routes using the imported middleware and controllers
router.get("/profile/:user_id?", isUser, isProfileOwner, getUserProfile);
router.get("/listAll", isUser, listAllUsers);  // Old route kept for compatibility
router.get("/profilesAll", isUser, listAllUsers);
router.patch('/profile/:user_id?', isUser, isProfileOwner, patchUserProfile);
router.delete('/profile/:user_id', isUser, isProfileOwner, deleteUserProfile);
router.patch('/promote-to-driver/:user_id?', isOwnerOrAdmin, promoteToDriver);

// Export the router using ES module syntax
export default router;
