import { Router } from 'express';
import { registerUser, loginUser,  passwordChange, sendPasswordResetLink, resetPassword } from './controllers.js'; // Adjust the path to the controllers module
// import { isUser } from '../middlewares/authMiddleware'; // Adjust the path to the middleware module

const router = Router();

router.post("/register", registerUser);
router.post('/login', loginUser);
router.post('/passwordchange', passwordChange);
router.post('/password_reset_link', sendPasswordResetLink);
router.post('/set_new_password', resetPassword);

export default router;
