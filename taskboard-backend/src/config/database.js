const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using the URI from environment variables.
 * @returns {Promise<void>}
 */
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDatabase };