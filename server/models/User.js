// User model for storing login credentials

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    // username: must be unique for login
    // passwordHash: bycrypt hash stored here
    username: { type: String, unique: true },  
    passwordHash: String
});

module.exports = mongoose.model("User", UserSchema);