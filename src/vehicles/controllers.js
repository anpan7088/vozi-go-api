import { pool } from '../db/db.mjs';

const Pool = pool.promise();

// Centralized error handler
const handleError = (res, error) => {
    console.error(error);
    res.status(500).json({ error: 'An error occurred, please try again later.' });
};

// Reusable query handler function
const handleQuery = async (res, query, params = [], successStatus = 200, singleResult = false) => {
    try {
        const [rows] = await Pool.query(query, params);
        if (singleResult && rows.length === 0) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        res.status(successStatus).json(singleResult ? rows[0] : rows);
    } catch (error) {
        handleError(res, error);
    }
};

// Get all vehicles
export const getVehicles = async (req, res) => {
    const sql = 'SELECT * FROM vehicles';
    await handleQuery(res, sql);
};

// Get vehicle by ID
export const getVehicleById = async (req, res) => {
    const sql = 'SELECT * FROM vehicles WHERE id = ?';
    const id = parseInt(req.params.id);
    await handleQuery(res, sql, [id], 200, true);
};

// Create a new vehicle
export const createVehicle = async (req, res) => {
    const sql = 'INSERT INTO vehicles (driver, seats, make, model, year, color, mileage) VALUES (?, ?, ?, ?, ?, ?, ?)';
    try {
        const { driver, seats, make, model, year, color, mileage } = req.body;
        const [result] = await Pool.query(sql, [driver, seats, make, model, year, color, mileage]);
        res.status(201).json({ id: result.insertId, driver, seats, make, model, year, color, mileage });
    } catch (error) {
        handleError(res, error);
    }
};

// Update a vehicle by ID
export const updateVehicle = async (req, res) => {
    const sql = 'UPDATE vehicles SET driver = ?, seats = ?, make = ?, model = ?, year = ?, color = ?, mileage = ? WHERE id = ?';
    const id = parseInt(req.params.id);
    try {
        const { driver, seats, make, model, year, color, mileage } = req.body;
        const [result] = await Pool.query(sql, [driver, seats, make, model, year, color, mileage, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        
        res.status(200).send(`Vehicle modified with ID: ${id}`);
    } catch (error) {
        handleError(res, error);
    }
};

// Delete a vehicle by ID
export const deleteVehicle = async (req, res) => {
    const sql = 'DELETE FROM vehicles WHERE id = ?';
    const id = parseInt(req.params.id);
    try {
        const [result] = await Pool.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.status(200).send(`Vehicle deleted with ID: ${id}`);
    } catch (error) {
        handleError(res, error);
    }
};
