import { pool } from '../db/db.mjs';

// Function to get the list of active drivers
export const getDriversList = async (req, res) => {
    const sql = `SELECT * FROM users WHERE is_active = 1 AND role = 'driver'`;

    try {
        const [results] = await pool.promise().query(sql);
        res.json(results);
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            sqlError: err.sqlMessage
        });
    }
};

// Default export of the function
export default {
    getDriversList
};
