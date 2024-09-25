const { pool } = require('../db/db');

const Pool = pool.promise();

// Centralized error handler
const handleError = (res, error) => {
    console.error(error);
    res.status(500).json({ error: 'An error occurred, please try again later.' });
};

// Reusable query handler function
const handleQuery = async (res, query, params = [], successStatus = 200, singleResult = false) => {
    try {
        const { rows, rowCount } = await Pool.query(query, params);
        if (singleResult && rowCount === 0) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        res.status(successStatus).json(singleResult ? rows[0] : rows);
    } catch (error) {
        handleError(res, error);
    }
};

const getVehicles = async (req, res) => {
    const sql = 'SELECT * FROM vehicles';
    try {
        const results = await Pool.query(sql);
        res.status(200).json(results[0]);
    } catch (error) {
        throw error;
    };
};

const getVehicleById = async (req, res) => {
    const sql = 'SELECT * FROM vehicles WHERE id = ?';
    try {
        const id = parseInt(req.params.id);
        const results = await Pool.query( sql, [id]);

        if (results.length === 0) {
            // Handle case where no vehicle with the given ID is found
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        res.status(200).json(results[0]); // Assuming only one vehicle per ID
    } catch (error) {
        throw error;
    };
};

const createVehicle = async (req, res) => {
    const sql = 'INSERT INTO vehicles (driver, seats, make, model, year, color, mileage) VALUES (?, ?, ?, ?, ?, ?, ?)';
    try {
        const { driver, seats, make, model, year, color, mileage } = req.body;
        const results = await Pool.query( sql, [driver, seats, make, model, year, color, mileage] );
        res.status(201).json(results[0]);
    } catch (error) {
        throw error;
    };
};

const updateVehicle = async (req, res) => {
    const sql = 'UPDATE vehicles SET driver = ?, seats = ?, make = ?, model = ?, year = ?, color = ?, mileage = ? WHERE id = ?';
    try {
        const id = parseInt(req.params.id);
        const { driver, seats, make, model, year, color, mileage } = req.body;
        await Pool.query( sql, [driver, seats, make, model, year, color, mileage, id]
        );
        res.status(200).send(`Vehicle modified with ID: ${id}`);
    } catch (error) {
        throw error;
    };
};

const deleteVehicle = async (req, res) => {
    const sql = 'DELETE FROM vehicles WHERE id = ?';
    try {
        const id = parseInt(req.params.id);
        await Pool.query( sql, [id]);
        res.status(200).send(`Vehicle deleted with ID: ${id}`);
    } catch (error) {
        throw error;
    };
};

module.exports = {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
};