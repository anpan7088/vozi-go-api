import { Router } from 'express';
import { getDriversList } from './controllers.js';

const router = Router();

router.get("/", getDriversList);

export default router;