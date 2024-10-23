import { Router } from 'express';
import * as controllers from './controllers.js';
const { getRides, getRideById, createRide, updateRide, deleteRide } = controllers;

const router = Router();

router.get('/', getRides);
router.get('/:id', getRideById);
router.post('/', createRide);
router.put('/:id', updateRide);
router.delete('/:id', deleteRide);

export default router;
