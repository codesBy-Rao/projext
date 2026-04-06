require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const allowStartWithoutDb = process.env.ALLOW_START_WITHOUT_DB === 'true';

const startServer = async () => {
  let dbConnected = false;

  try {
    await connectDB();
    dbConnected = true;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);

    if (!allowStartWithoutDb) {
      process.exit(1);
    }

    console.warn('ALLOW_START_WITHOUT_DB=true, starting API in degraded mode.');
  }

  app.listen(PORT, () => {
    const mode = dbConnected ? 'normal' : 'degraded (no database)';
    console.log(`Server running on http://localhost:${PORT} in ${mode} mode`);
  });
};

startServer();
