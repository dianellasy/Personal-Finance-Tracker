// Main entry point for the backend server: loads environment variables, sets up Express, connects to MongoDB, and mounts all routes

// Load .env variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.static("public"));
const connectMongoDB = require("./server/config/database");

// Enable CORS, so the client or frontend can communicate with the server
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Connect to MongoDB using the student's required database name pattern
connectMongoDB();

// Mount authentication routes (signup + login)
app.use("/authentication", require("./server/routes/authentication"));

// Mount transaction CRUD routes 
app.use("/transactions", require("./server/routes/transactions"));

// Start the server on port 3000
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});