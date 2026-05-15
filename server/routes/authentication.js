// Authentication routes: signup & login
// Handles password hashing and token creation

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// Load secret key from .env
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// POST /auth/signup
router.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

        // If there is no username or password
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Check if the username already exists 
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(409).json({ message: "Username is already taken" });
        }

        // Hash password using the bcrypt library before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ username, hashedPassword});

        res.status(201).json({ message: "Account created successfully" });

    } catch (error) {
        console.error("Error signing up: ", error);
        res.status(500).json({ message: "Server error when signing up" });
    }
});


// POST /auth/login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // If there is no username or password
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Search/look up the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare password with stored hash
        const passMatch = await bcrypt.compare(password, user.passwordHash)

        if (!passMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.status(200).json({ token });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});


module.exports = router;