import { pool } from '../db/db.mjs';

// Base query
const masterQuery = `
    SELECT 
        rides.id AS rideID,
        rides.start_time,
        depart_mesta.city as depart,
        dest_mesta.city as dest,
        depart_mesta.country as depart_country,
        dest_mesta.country as dest_country,
        users.id userID,
        users.username username,
        users.firstName,
        users.lastName,
        vehicles.make,
        vehicles.model,
        vehicles.seats,
        vehicles.color,
        vehicles.license_plate
    FROM rides
    INNER JOIN mesta AS depart_mesta ON depart_mesta.id=rides.depart
    INNER JOIN mesta AS dest_mesta ON dest_mesta.id=rides.destination
    INNER JOIN vehicles ON vehicles.id=rides.vehicle
    INNER JOIN users ON users.id=vehicles.driver
`;

// Get all rides with filters
export const getRides = async (req, res) => {
    const { search, sort, departFilter, destFilter, voziloFilter } = req.query;
console.log(req.query);
    // Initialize conditions array and parameters array for SQL
    let conditions = [];
    let params = [];

    // Add conditions based on filters
    if (departFilter) {
        conditions.push(`depart_mesta.city = ?`);
        params.push(departFilter);
    }

    if (destFilter) {
        conditions.push(`dest_mesta.city = ?`);
        params.push(destFilter);
    }

    if (voziloFilter) {
        conditions.push(`vehicles.make = ?`);
        params.push(voziloFilter);
    }

    if (search) {
        conditions.push(`(users.username LIKE ? OR users.firstName LIKE ? OR users.lastName LIKE ?)`);
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
    }

    // Add WHERE clause if there are any conditions
    let whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Add sorting if provided, else default to sorting by start_time
    let orderBy = 'ORDER BY rides.start_time DESC';
    if (sort) {
        orderBy = `ORDER BY ${sort}`;
    }

    // Combine the query
    const sql = `${masterQuery} ${whereClause} ${orderBy}`;

    try {
        // Execute the query with parameters
        const [result] = await pool.promise().query(sql, params);
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
// export default {
//     createRide,
//     getRides,
//     getRideById,
//     updateRide,
//     deleteRide,
// };
