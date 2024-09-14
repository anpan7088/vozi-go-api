const { pool } = require('../db/db');

const getVehicles = (req, res) => {
    pool.query('SELECT * FROM vehicles', (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results);
    });
};

const getVehicleById = (req, res) => {
    const id = parseInt(req.params.id);
    pool.query('SELECT * FROM vehicles WHERE id = ?', [id], (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results);
    });
};

const createVehicle = (req, res) => {
    const { driver, seats, make, model, year, color, mileage } = req.body;
    pool.query(
        'INSERT INTO vehicles (driver, seats, make, model, year, color, mileage) VALUES (?, ?, ?, ?, ?, ?, ? ) RETURNING *',
        [ driver, seats, make, model, year, color, mileage],
        (error, results) => {
            if (error) {
                throw error;
            }
            res.status(201).json(results[0]);
        }
    );
};

const  updateVehicle = (req, res) => {
    const id = parseInt(req.params.id);
    const { driver, seats, make, model, year, color, mileage } = req.body;
    pool.query(
        'UPDATE vehicles SET driver = $1, seats = $2, make = $3, model = $4, year = $5, color = $6, mileage = $7 WHERE id = $8',
        [ driver, seats, make, model, year, color, mileage, id],
        (error, results) => {
            if (error) {
                throw error;
            }
            res.status(200).send(`Vehicle modified with ID: ${id}`);
        }
    );
};

const deleteVehicle = (req, res) => {
    const id = parseInt(req.params.id);
    pool.query('DELETE FROM vehicles WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).send(`Vehicle deleted with ID: ${id}`);
    });
};

module.exports = {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
};