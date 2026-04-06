const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const isJsonParseError = err instanceof SyntaxError && err.status === 400 && 'body' in err;
  const isPayloadTooLargeError = err.type === 'entity.too.large';

  const statusCode = err.statusCode || err.status || (isJsonParseError ? 400 : isPayloadTooLargeError ? 413 : 500);
  const isProduction = (process.env.NODE_ENV || 'development') === 'production';
  const message = isJsonParseError
    ? 'Invalid JSON payload'
    : isPayloadTooLargeError
    ? 'Payload too large (max 1mb)'
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    status: 'error',
    message,
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
