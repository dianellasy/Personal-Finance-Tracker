// Handle the MongoDB connection using Mongoose

const mongoose = require("mongoose");

module.exports = async function connectMongoDB() {
    try {
        const database_name = "cpsc431_sydianella"

        // Connect to local MongoDB instance
        await mongoose.connect(`mongodb://127.0.0.1:27017/${database_name}`);

        console.log("MongoDB connected");
    } catch (error) {
        console.error("Database connection error:", error);
    }    
};