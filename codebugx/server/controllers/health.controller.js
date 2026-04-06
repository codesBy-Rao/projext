const mongoose = require('mongoose');

const healthCheck = (req, res) => {
  const dbReadyState = mongoose.connection.readyState;
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'success',
    message: 'API healthy',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      state: dbStateMap[dbReadyState] || 'unknown',
      readyState: dbReadyState,
    },
  });
};

module.exports = {
  healthCheck,
};
