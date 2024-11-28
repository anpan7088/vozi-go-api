import { Router } from 'express';
import { registerUser, loginUser,  passwordChange, sendPasswordResetLink, resetPassword } from './controllers.js'; // Adjust the path to the controllers module

const router = Router();

router.post("/register", registerUser);
router.post('/login', loginUser);
router.post('/passwordchange', passwordChange);
router.post('/password_reset_link', sendPasswordResetLink);
router.post('/password_reset', resetPassword);

export default router;
