import { pool } from '../db/db.mjs';

export const  getRoles = async (req, res) => {
    const sql = "SELECT `id`, `description` FROM roles";
    try {
        const [result] = await pool.promise().query(sql);
        res.json(result);
    } catch (err) {
        res.status(500).send(err);
    }
};

