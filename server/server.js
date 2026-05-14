// Main entry point for the backend server: loads environment variables, sets up Express, connects to MongoDB, and mounts all routes

// Load .env variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const connectMongoDB = require("./config/db");

// Enable CORS, so the client or frontend can communicate with the server
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Connect to MongoDB using the student's required database name pattern
connectMongoDB();

// Mount authentication routes (signup + login)
app.use("/auth", require("./routes/auth"));

// Mount transaction CRUD routes 
app.use("/transactions", require("./routes/transactions"));

// Start the server on port 3000
app.listen(3000, () => {
    console.log("Server running on port 3000");
});