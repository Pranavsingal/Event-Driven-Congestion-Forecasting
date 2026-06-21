const mongoose = require('mongoose');

const connectDB = async () => {
  // If already connected, return the connection instance
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("No MONGODB_URI environment variable detected. Running in memory-fallback mode.");
    return null;
  }
  
  try {
    await mongoose.connect(uri);
    console.log("MongoDB database connected successfully.");
    return mongoose.connection;
  } catch (err) {
    console.error("Failed to connect to MongoDB database:", err.message);
    return null;
  }
};

module.exports = connectDB;
