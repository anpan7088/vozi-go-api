import { Router } from 'express';
import { getDbHealth, getHealth, getNeofetch } from './controllers.js';
import { isAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getHealth );
router.get('/database', getDbHealth);
router.get('/neofetch', isAdmin, getNeofetch);

export default router;