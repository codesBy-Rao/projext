const requireAdminToken = (req, res, next) => {
  const expectedToken = process.env.DEMO_RESET_TOKEN;

  if (!expectedToken) {
    const error = new Error('DEMO_RESET_TOKEN is not configured on the server');
    error.statusCode = 503;
    return next(error);
  }

  const providedToken = req.headers['x-admin-token'];

  if (typeof providedToken !== 'string' || providedToken !== expectedToken) {
    const error = new Error('Invalid admin token');
    error.statusCode = 403;
    return next(error);
  }

  return next();
};

module.exports = {
  requireAdminToken,
};
