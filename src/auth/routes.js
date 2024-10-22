import { Router } from 'express';
import { registerUser, loginUser } from './controllers.js'; // Adjust the path to the controllers module

const router = Router();

router.post("/register", registerUser);
router.post('/login', loginUser);

export default router;
