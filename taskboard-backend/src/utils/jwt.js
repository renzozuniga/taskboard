const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for the given user ID.
 * @param {string} userId - The user's MongoDB ObjectId
 * @returns {string} The signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Verifies and decodes a JWT token.
 * @param {string} token - The JWT token to verify
 * @returns {object} The decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };