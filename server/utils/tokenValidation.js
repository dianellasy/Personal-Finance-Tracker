// Middleware that validates the user's token
// If the token is missing or invalid, the request will be rejected

const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

module.exports = function (req, res, next) {
    const jwtTokenInAuthorizationHeader = req.headers.authorization;

    // If there is no JWT token in authorization header
    if (!jwtTokenInAuthorizationHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Set token equal to token in "Bearer <token>"
    const token = jwtTokenInAuthorizationHeader.split(" ")[1];
    next();

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);

        // Attach user info to request for later use
        req.user = decoded;

        // Allow request to continue
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};