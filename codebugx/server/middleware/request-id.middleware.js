const crypto = require('crypto');

const assignRequestId = (req, res, next) => {
  const fallbackId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const requestId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : fallbackId;

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

module.exports = {
  assignRequestId,
};
