// healt controller 
import { pool } from '../db/db.mjs';

// Function to get health status
export const getHealth = (req, res) => {
    res.status(200).send('OK');
};

// Function to get database health status
export const getDbHealth = async (req, res) => {
    const sql = `SELECT * FROM healt WHERE kluch = 'dbUp'`;
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
// export default {
//     getDbHealth
// };
