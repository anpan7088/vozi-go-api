import { pool } from '../db/db.mjs';

// Get all rides
export const getAllRides = async (req, res) => {
    const sql = 'SELECT * FROM rides';
    try {
        const [result] = await pool.promise().query(sql);
        res.json(result);
    } catch (err) {
        res.status(500).send(err);
    }
};

// Get a ride by ID
export const getRideById = async (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM rides WHERE id = ?';
    try {
        const [result] = await pool.promise().query(sql, [id]);
        if (result.length === 0) return res.status(404).json({ message: 'Ride not found' });
        res.json(result[0]);
    } catch (err) {
        res.status(500).send(err);
    }
};

// Create a new ride
export const createRide = async (req, res) => {
    const { depart, destination, start_time, vehicle } = req.body;
    const sql = 'INSERT INTO rides (depart, destination, start_time, vehicle) VALUES (?, ?, ?, ?)';
    try {
        const [result] = await pool.promise().query(sql, [depart, destination, start_time, vehicle]);
        res.status(201).json({ id: result.insertId, depart, destination, start_time, vehicle });
    } catch (err) {
        res.status(500).send(err);
    }
};

// Update a ride by ID
export const updateRide = async (req, res) => {
    const { id } = req.params;
    const { depart, destination, start_time, vehicle } = req.body;
    const sql = 'UPDATE rides SET depart = ?, destination = ?, start_time = ?, vehicle = ? WHERE id = ?';
    try {
        const [result] = await pool.promise().query(sql, [depart, destination, start_time, vehicle, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Ride not found' });
        res.json({ message: 'Ride updated successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
};

// Delete a ride by ID
export const deleteRide = async (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM rides WHERE id = ?';
    try {
        const [result] = await pool.promise().query(sql, [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Ride not found' });
        res.json({ message: 'Ride deleted successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
};

// Default export of all functions
export default {
    createRide,
    getAllRides,
    getRideById,
    updateRide,
    deleteRide,
};
