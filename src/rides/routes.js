import { Router } from 'express';
import * as controllers from './controllers.js';
const { getAllRides, getRideById, createRide, updateRide, deleteRide } = controllers;

const router = Router();

router.get('/', getAllRides);
router.get('/:id', getRideById);
router.post('/', createRide);
router.put('/:id', updateRide);
router.delete('/:id', deleteRide);

export default router;

