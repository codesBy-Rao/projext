require('dotenv').config();

const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('Error: Mongo URI is missing. Set MONGO_URI (preferred) or MONGODB_URI in .env');
  process.exit(1);
}

const client = new MongoClient(mongoUri);

// Async function to check the connection
async function checkConnection() {
  try {
    console.log('Connecting to MongoDB...');

    // Connect to the database
    await client.connect();
    console.log('Connection successful');

    // Perform a lightweight ping command to verify the connection
    console.log('Pinging the MongoDB server...');
    await client.db('admin').command({ ping: 1 });
    console.log('Ping successful: MongoDB is reachable');
  } catch (error) {
    console.error('Error: Unable to connect to MongoDB');
    console.error(`Details: ${error.message}`);
    process.exitCode = 1;
  } finally {
    // Close the connection
    await client.close();
    console.log('Connection closed');
  }
}

// Run the connection check
checkConnection();