const dotenv = require('dotenv'); // Importing the ".env" file
const mysql2 = require("mysql2");
dotenv.config(); // Loading the ".env" file

const RETRY_LIMIT = 5; // Number of connection retry attempts
const RETRY_DELAY = 5000; // Delay between retries in milliseconds (5 seconds)

const createPoolWithRetry = (retryCount = 0) => {
    // Create the connection pool
    const pool = mysql2.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // Get a connection from the pool to check the connection
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err.stack);

            if (retryCount < RETRY_LIMIT) {
                console.log(`Retrying connection (${retryCount + 1}/${RETRY_LIMIT})...`);
                setTimeout(() => createPoolWithRetry(retryCount + 1), RETRY_DELAY);
            } else {
                console.error('Failed to connect to the database after multiple attempts.');
            }
            return;
        }

        console.log('Connected to the database as id', connection.threadId);
        connection.release(); // Release the connection back to the pool
    });

    return pool;
};


const safeEscape = (value) => {
    if (value === null || value === undefined) {
        return 'NULL';
    }

    switch (typeof value) {
        case 'number':
            return value; // Numbers don't need escaping
        case 'boolean':
            return value ? 1 : 0; // Convert boolean to integer
        case 'object':
            if (Array.isArray(value)) {
                return value.map(item => safeEscape(item)).join(', ');
            } else {
                // Convert object to JSON string
                return mysql2.escape(JSON.stringify(value));
            }
        case 'string':
            return mysql2.escape(value);
        default:
            throw new Error('Unsupported data type');
    }
}


const pool = createPoolWithRetry(); // Create the pool with retry logic

module.exports = {
    pool,            // Export the pool for use in other parts of the application
    safeEscape
};
