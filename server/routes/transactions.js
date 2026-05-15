const express = require("express");
const router = express.Router();
const authentication = require("../utils/tokenValidation");
const Transaction = require("../models/Transaction");

// Apply token validation
router.use(authentication);

// CREATE
router.post("/", async (req, res) => {
    try {
        const { amount, category, date, description } = req.body;

        if (!amount || !category || !date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const transaction = await Transaction.create({
            userId: req.user.userId,
            amount,
            category,
            date,
            description
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Server error when creating transaction" });
    }
});

// GET ALL
router.get("/", async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.userId });
        res.status(200).json(transactions);
    } catch (error) {
        console.error("Fetch transactions error:", error);
        res.status(500).json({ message: "Server error fetching transactions" });
    }
});

// DELETE
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Transaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!deleted) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction deleted" });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ message: "Server error deleting transaction" });
    }
});

module.exports = router;