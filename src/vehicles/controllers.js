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
        res.status(successStatus).json(rows);
        // res.status(successStatus).json(singleResult ? rows[0] : rows); // blesavo za singleResult da ne e niza
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

// Get vehicles by driver
export const getVehiclesByDriver = async (req, res) => {
    const sql = 'SELECT * FROM vehicles WHERE driver = ?';
    const driver = req.params.driver;
    await handleQuery(res, sql, [driver], 200, true);
};

// Create a new vehicle
export const createVehicle = async (req, res) => {
    const vehicleData = req.body;

    // Validate that the request body is not empty
    if (!vehicleData || Object.keys(vehicleData).length === 0) {
        return res.status(400).json({ message: 'No fields provided to create a vehicle' });
    }

    // Dynamically extract columns and values
    const columns = Object.keys(vehicleData); // Extract keys as column names
    const values = Object.values(vehicleData); // Extract values
    const placeholders = columns.map((_, index) => ` ?`).join(', '); // Create placeholders dynamically

    // Construct the query dynamically
    const sql = `INSERT INTO vehicles (${columns.join(', ')}) VALUES (${placeholders})`;

    // console.log('Insert Query:', insertQuery);
    // console.log('Values:', values);
    try { 
        await Pool.query(sql, values);
        res.json({
            status: true,
            message: 'Vehicle data inserted successfully',
            values: values,
        });
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            sqlError: err.sqlMessage,
        });
    }
};

// Update a vehicle by ID
export const patchVehicle = async (req, res) => {
    const vehicle_id = parseInt(req.params.id);
    const fieldsToUpdate = req.body;

    // Empty list to store the fields to update
    let updateFields = [];
    let updateValues = [];

    // Loop through the fields to update and build the SQL query
    for (const field in fieldsToUpdate) {
        updateFields.push(`${field} = ?`);
        updateValues.push(fieldsToUpdate[field]);
    }
    if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    updateValues.push(vehicle_id);
    // Construct the SQL query from the list of fields to update
    const sql = `UPDATE vehicles SET ${updateFields.join(", ")} WHERE id = ?`;
    // Execute the SQL query
    try {
        await Pool.query(sql, updateValues);
        res.json({
            status: true,
            message: 'Vehicle data updated successfully',
            values: fieldsToUpdate,
        });
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            sqlError: err.sqlMessage,
        });
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
