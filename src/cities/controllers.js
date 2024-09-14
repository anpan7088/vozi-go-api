const { pool } = require('../db/db');

const getCitiesByName = async (req, res) => {
    const sql = `CALL SearchCitiesByName(?);`;
    try {
        const name = req.params.name;
        const [results] = await pool.promise().execute(sql, [name]);
        res.json({ count: results[0].length, data: results[0] });
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            sqlError: err.sqlMessage
        });
    }
};

const getCitiesByCountry = async (req, res) => {
    const sql = `CALL SearchCitiesByCountry(?);`;

    try {
        const country = req.params.country;
        const [results] = await pool.promise().query(sql, [country]);
        res.json({ count: results[0].length, data: results[0] });
    } catch (err) {
        console.error("Error in SQL query:", err);
        res.status(500).json({
            error: 'Internal Server Error',
            sqlError: err.sqlMessage
        });
    }
};

module.exports = {
    getCitiesByName,
    getCitiesByCountry
};
