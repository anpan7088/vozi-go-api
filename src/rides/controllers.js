import { pool } from '../db/db.mjs';

// Get all rides master query
const masterQuery = `
    SELECT 
        rides.id AS rideID,
        rides.start_time,
        depart_mesta.city as depart,
        depart_mesta.country_id as depart_country_id,
        depart_mesta.id as depart_mesta_id,
        dest_mesta.city as dest,
        dest_mesta.country_id as dest_country_id,
        dest_mesta.id as dest_mesta_id,
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
    INNER JOIN vehicles ON vehicles.id=rides.vehicle_id
    INNER JOIN users ON users.id=vehicles.driver
`;

// Query to count total rides matching filters
const countQuery = `
    SELECT COUNT(*) as total
    FROM rides
    INNER JOIN mesta AS depart_mesta ON depart_mesta.id=rides.depart
    INNER JOIN mesta AS dest_mesta ON dest_mesta.id=rides.destination
    INNER JOIN vehicles ON vehicles.id=rides.vehicle_id
    INNER JOIN users ON users.id=vehicles.driver
`;

const departListQuery = `
    SELECT distinct(depart) as id, mesta.city FROM rides 
    INNER JOIN mesta on mesta.id=rides.depart
`;

const destListQuery = `
    SELECT distinct(destination) as id, mesta.city FROM rides
    INNER JOIN mesta on mesta.id=rides.destination
`;

// Get Depart list
export const getDepartList = async (req, res) => {
    try {
        const [departList] = await pool.promise().query(departListQuery);
        res.json(departList);
    } catch (err) {
        res.status(500).send(err);
    }
};

// Get Dest list
export const getDestList = async (req, res) => {
    try {
        const [destList] = await pool.promise().query(destListQuery);
        res.json(destList);
    } catch (err) {
        res.status(500).send(err);
    }
};

// Get all rides with filters
export const getRides = async (req, res) => {
    const { search, sort, departMesta, destMesta, voziloFilter, licensePlate, departMestaId, destMestaId, limit = 10, page = 1 } = req.query;

    // Initialize conditions array and parameters array for SQL
    let conditions = [];
    let params = [];

    // Add conditions based on filters
    if (departMesta) {
        conditions.push(`depart_mesta.city = ?`);
        params.push(departMesta);
    }

    if (destMesta) {
        conditions.push(`dest_mesta.city = ?`);
        params.push(destMesta);
    }

    if (voziloFilter) {
        conditions.push(`vehicles.make = ?`);
        params.push(voziloFilter);
    }

    if (departMestaId) {
        conditions.push(`depart_mesta.id = ?`);
        params.push(departMestaId);
    }

    if (destMestaId) {
        conditions.push(`dest_mesta.id = ?`);
        params.push(destMestaId);
    }

    if (licensePlate) {
        conditions.push(`vehicles.license_plate = ?`);
        params.push(licensePlate);
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

    // Pagination: calculate offset and limit
    const limitValue = parseInt(limit, 10) || 10;  // Default to 10 results per page if not provided
    const pageValue = parseInt(page, 10) || 1;     // Default to page 1 if not provided
    const offset = (pageValue - 1) * limitValue;

    // Combine the query with pagination (LIMIT and OFFSET)
    const sql = `${masterQuery} ${whereClause} ${orderBy} LIMIT ? OFFSET ?`;

    // Add limit and offset to params array
    params.push(limitValue, offset);

    try {
        // Step 1: Get the total count of rides (for pagination)
        const totalSql = `${countQuery} ${whereClause}`;
        const [totalResult] = await pool.promise().query(totalSql, params);
        const totalRides = totalResult[0].total;

        // Step 2: Calculate the number of pages
        const totalPages = Math.ceil(totalRides / limitValue);

        // Step 3: Get the rides with pagination (LIMIT and OFFSET)
        const sql = `${masterQuery} ${whereClause} ${orderBy} LIMIT ? OFFSET ?`;
        params.push(limitValue, offset);

        const [ridesResult] = await pool.promise().query(sql, params);

        // Step 4: Send the response with pagination data
        res.json({
            page: pageValue,
            limit: limitValue,
            totalResults: totalRides,
            totalPages: totalPages,
            rides: ridesResult
        });
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


export default {
    getRides,
    getRideById,
    createRide,
    updateRide,
    deleteRide,
    getDepartList,
    getDestList
}