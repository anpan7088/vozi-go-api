// ridesController.js
const { pool } = require('../db/db');


// Get all rides
const getAllRides = (req, res) => {
    const sql = 'SELECT * FROM rides';
    pool.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
};

// Get a ride by ID
const getRideById = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM rides WHERE id = ?';
    pool.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(404).json({ message: 'Ride not found' });
        res.json(result[0]);
    });
};


// Create a new ride
const createRide = (req, res) => {
    const { depart, destination, start_time, vehicle } = req.body;
    const sql = 'INSERT INTO rides (depart, destination, start_time, vehicle) VALUES (?, ?, ?, ?)';
    pool.query(sql, [depart, destination, start_time, vehicle], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ id: result.insertId, depart, destination, start_time, vehicle });
    });
};


// Update a ride by ID
const updateRide = (req, res) => {
    const { id } = req.params;
    const { depart, destination, start_time, vehicle } = req.body;
    const sql = 'UPDATE rides SET depart = ?, destination = ?, start_time = ?, vehicle = ? WHERE id = ?';

    pool.query(sql, [depart, destination, start_time, vehicle, id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Ride not found' });
        res.json({ message: 'Ride updated successfully' });
    });
};

// Delete a ride by ID
const deleteRide = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM rides WHERE id = ?';
    pool.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Ride not found' });
        res.json({ message: 'Ride deleted successfully' });
    });
};

module.exports = {
    createRide,
    getAllRides,
    getRideById,
    updateRide,
    deleteRide,
};