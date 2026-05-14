// Transaction model for storing financial entries
// Each transaction belongs to a specific user

const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    // userId: links transaction to a user
    // amount: amount of the transaction
    // category: category of the transaction
    // date: date of the transaction
    // description: description of the transaction
    userId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    category: String,
    date: Date,
    description: String
});

module.exports = mongoose.model("Transaction", TransactionSchema);