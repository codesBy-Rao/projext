require('dotenv').config();

const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('MongoDB connection failed: MONGO_URI (or MONGODB_URI) is not defined');
  process.exit(1);
}

const testConnection = async () => {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connection successful');
    await mongoose.connection.close();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exitCode = 1;
  }
};

testConnection();