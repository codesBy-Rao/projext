// mongodbExample.js
// This script demonstrates basic MongoDB Atlas operations using Mongoose.

// Import the Mongoose library
const mongoose = require('mongoose');

// Load environment variables from .env file
require('dotenv').config();

// Read the MongoDB URI from environment variables or fallback to a default
const MONGODB_URI = 'mongodb+srv://rao:12345@cluster0.ueterkk.mongodb.net/test?retryWrites=true&w=majority';

// Debug: Log the MONGO_URI to verify it's being read correctly
console.log('MONGO_URI:', MONGODB_URI);

// Ensure the URI is defined
if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined. Set it in your environment variables.');
  process.exit(1);
}

// Define the schema for the collection
const exampleSchema = new mongoose.Schema({
  name: String, // Name of the entity
  description: String, // Description of the entity
  createdAt: Date, // Timestamp for creation
});

// Create a model for the collection
const Example = mongoose.model('Example', exampleSchema);

// Async function to demonstrate MongoDB operations
async function runExample() {
  try {
    console.log('Connecting to MongoDB Atlas...');

    // Connect to MongoDB Atlas
    await mongoose.connect(MONGODB_URI);
    console.log('Connection successful!');

    // Insert 10 realistic documents
    console.log('Inserting documents...');
    const now = new Date();
    const documents = Array.from({ length: 10 }, (_, i) => ({
      name: `Entity ${i + 1}`,
      description: `This is a description for entity ${i + 1}`,
      createdAt: new Date(now.getTime() - i * 1000 * 60), // Spread timestamps by 1 minute
    }));
    await Example.insertMany(documents);
    console.log('Documents inserted successfully!');

    // Read and print the 5 most recent documents
    console.log('Fetching the 5 most recent documents...');
    const recentDocs = await Example.find().sort({ createdAt: -1 }).limit(5);
    console.log('Most recent documents:', recentDocs);

    // Read and print one document by _id
    console.log('Fetching one document by _id...');
    const oneDoc = await Example.findOne(); // Fetch the first document
    console.log('Document fetched by _id:', oneDoc);

  } catch (error) {
    console.error('Error occurred:', error.message);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
}

// Run the example
runExample();