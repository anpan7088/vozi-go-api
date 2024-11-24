import { Router } from 'express';
import { getDbHealth, getHealth } from './controllers.js';

const router = Router();

router.get('/', getHealth );
router.get('/database', getDbHealth);

export default router;