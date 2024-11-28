import bcrypt from 'bcrypt';
import { pool } from '../db/db.mjs'; // Adjust the path to your db connection

const usersTable = process.env.USERS_TABLE || 'users';
const saltRounds = 10;

const encryptPasswords = async () => {
    try {
        // Fetch users with plaintext passwords (assumed to be < 60 characters)
        const [users] = await pool.promise().query(`SELECT id, password FROM ${usersTable} WHERE LENGTH(password) < 60`);

        for (const user of users) {
            const { id, password } = user;

            // Hash the plaintext password
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Update the user's password in the database
            await pool.promise().query(`UPDATE ${usersTable} SET password = ? WHERE id = ?`, [hashedPassword, id]);

            console.log(`Password updated for user ID: ${id}`);
        }

        console.log('All unencrypted passwords have been updated.');
    } catch (err) {
        console.error('Error encrypting passwords:', err);
    } finally {
        // Close the database connection if needed
        pool.end();
    }
};

// Run the script
encryptPasswords();
