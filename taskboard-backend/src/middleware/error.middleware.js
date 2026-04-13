/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a structured JSON response.
 * @param {Error} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Validation error', errors });
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate value. This record already exists.' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error'
  });
};

module.exports = { errorHandler };