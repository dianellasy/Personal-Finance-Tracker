const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// SIGNUP
router.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(409).json({ message: "Username is already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ username, passwordHash: hashedPassword });

        res.status(201).json({ message: "Account created successfully" });
    } catch (error) {
        console.error("Error signing up:", error);
        res.status(500).json({ message: "Server error when signing up" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const passMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

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
