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
        res.json(results[0]);
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            sqlError: err.sqlMessage
        });
    }
};

// Import the exec function from the child_process module
import { exec } from 'child_process';
// unction to get neofetch from server
export const getNeofetch = async (req, res) => {
    exec('neofetch --stdout', (error, stdout, stderr) => {
        if (error) {
            console.error("Error executing neofetch:", error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }

        if (stderr) {
            console.error("Error output from neofetch:", stderr);
            return res.status(500).json({
                error: 'Internal Server Error',
                stderr
            });
        }

        try {
            // Parse neofetch output
            const lines = stdout.split('\n');
            const parsedOutput = {};

            lines.forEach(line => {
                const [key, value] = line.split(':').map(part => part.trim());
                if (key && value) {
                    const formattedKey = key.toLowerCase().replace(/\s+/g, '_'); // Convert keys to snake_case
                    parsedOutput[formattedKey] = value;
                }
            });

            res.json(parsedOutput);
        } catch (parseError) {
            console.error("Error parsing neofetch output:", parseError);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to parse neofetch output',
                details: parseError.message
            });
        }
    });
};

