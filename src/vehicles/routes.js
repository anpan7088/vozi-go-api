import { Router } from 'express';
import * as controllers from './controllers.js';
const { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle, getVehiclesByDriver } = controllers;

const router = Router();

router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.get('/driver/:driver', getVehiclesByDriver);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
