const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = (process.env.NODE_ENV || 'development') === 'production';

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal server error',
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
