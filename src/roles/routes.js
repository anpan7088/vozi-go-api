import { Router } from 'express';
import * as controllers from './controllers.js';

const { getRoles } = controllers;

const router = Router();

router.get('/', getRoles);

export default router;