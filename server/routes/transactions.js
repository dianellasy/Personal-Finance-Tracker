// CRUD routes for transactions

const express = require("express");
const router = express.Router();
const authentication = require("../utils/tokenValidation");
const Transaction = require("../models/Transaction");

// Apply token validation to all routes
router.use(authentication);

// Create transaction
// POST /transactions
router.post("/", async (req, res) => {
    try {
        const { amount, category, date, description } = req.body;

        // If the required fields are missing
        if (!amount || !category || !date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Create transaction tied to the logged-in user
        const transaction = await Transaction.create({
            userId: req.user.userId,
            amount,
            category,
            date,
            description
        });

        // Return the created transaction
        res.status(201).json(transaction);

    } catch (error) {
        console.error("Error when creating transaction:", error);
        res.status(500).json({ message: "Server error when creating transaction" });
    }
});


// Get all transactions
// GET /transactions
router.get("/", async (req, res) => {
    try {
        // Fetch the user's transactions
        const transactions = await Transaction.find({ userId: req.user.userId });

        // Return array of transactions
        res.status(200).json(transactions);

    } catch (error) {
        console.error("Fetch transactions error:", error);
        res.status(500).json({ message: "Server error fetching transactions" });
    }
});


// Update transaction
// PUT /transactions/:id
router.put("/:id", async (req, res) => {
    try {
        // Only update if the new transaction belongs to the logged-in user
        const updatedTransaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            req.body,
            { new: true }
        );

        // If no transaction is found
        if (!updatedTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Return updated transaction
        res.status(200).json(updatedTransaction);

    } catch (error) {
        console.error("Update transaction error:", error);
        res.status(500).json({ message: "Server error updating transaction" });
    }
});


// Delete transaction
// DELETE /transactions/:id
router.delete("/:id", async (req, res) => {
    try {
        // Only delete if the transaction belongs to the logged-in user
        const deletedTransaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        // If no transaction is found
        if (!deletedTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Return success message
        res.status(200).json({ message: "Transaction deleted" });

    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ message: "Server error deleting transaction" });
    }
});

module.exports = router;