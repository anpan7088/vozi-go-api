// Importing necessary modules
import express, { json, urlencoded } from "express";
import cors from 'cors';
import jwt from 'jsonwebtoken'; // If you use jwt later in the file, otherwise remove this import

// Importing routes
import authRoutes from './auth/routes.js';  // Explicitly specify the file extension
import userProfileRoutes from './userProfiles/routes.js';  // Ensure .js extension for ESM
import citiesRoutes from './cities/routes.js';  // Adjusted for ES Modules
import vehicleRoutes from './vehicles/routes.js';  // Adjusted for ES Modules
import ridesRoutes from './rides/routes.js';  // Adjusted for ES Modules
import driversRoutes from './drivers/routes.js';  // Adjusted for ES Modules
import rolesRoutes from './roles/routes.js';  // Adjusted for ES Modules
import healthRoutes from './health/routes.js';  // Adjusted for ES Modules

const PORT = process.env.PORT || 8088;

// Define allowed origins for CORS based on environment
// for development, you can use 'http://localhost:5173' and 'http://localhost:5174'
// for production, you can use 'https://vozi-go.sman.cloud' and all localhost other URLs should be blocked
const corsOptions = {
    origin: [
        'https://vozi-go.sman.cloud', 
        'http://localhost:5173',
        'http://localhost:5174',
        'http://158.220.121.142:5173/',
        'http://158.220.121.142:5174',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

// Create express app instance and set cors options
const app = express();
app.use(cors(corsOptions));
app.use(json());
app.use(urlencoded({ extended: true }));

// Root route
app.get("/", (req, res) => {
    res.send({ "message": "Welcome to Vozi-Go API!" });
});

// Serve static files from the 'public' directory
app.use('/', express.static('public'));
// Serve static files from the 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));

// Use the routes
app.use("/auth", authRoutes);
app.use("/user", userProfileRoutes);
app.use("/roles", rolesRoutes);
app.use("/cities", citiesRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/rides", ridesRoutes);
app.use("/drivers", driversRoutes);
// Health check endpoint
app.use('/health', healthRoutes);



// Start server on port 8088 or from process.env.PORT
app.listen(PORT, () => {
    console.log("App is running on port " + PORT);
});
