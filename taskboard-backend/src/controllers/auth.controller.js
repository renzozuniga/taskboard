const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Registers a new user account.
 * @route POST /api/auth/register
 * @param {Request} req - Express request with { name, email, password } in body
 * @param {Response} res - Express response
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticates a user and returns a JWT token.
 * @route POST /api/auth/login
 * @param {Request} req - Express request with { email, password } in body
 * @param {Response} res - Express response
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns the authenticated user's profile.
 * @route GET /api/auth/me
 * @param {Request} req - Express request (requires authentication)
 * @param {Response} res - Express response
 */
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };