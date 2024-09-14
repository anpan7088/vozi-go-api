const express = require('express');
const { getAllRides, getRideById, createRide, updateRide, deleteRide } = require('./controllers');

const router = express.Router();

router.get('/', getAllRides);
router.get('/:id', getRideById);
router.post('/', createRide);
router.put('/:id', updateRide);
router.delete('/:id', deleteRide);

module.exports = router;

