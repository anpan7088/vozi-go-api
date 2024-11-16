import { Router } from 'express';
import * as controllers from './controllers.js';
const { getVehicles, getVehicleById, createVehicle, patchVehicle, deleteVehicle, getVehiclesByDriver } = controllers;

const router = Router();

router.get('/:id', getVehicleById);
router.get('/', getVehicles);
router.get('/driver/:driver', getVehiclesByDriver);
router.post('/', createVehicle);
router.patch('/:id', patchVehicle);
router.delete('/:id', deleteVehicle);

export default router;
