const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Authorization token missing');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret');

    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};

module.exports = {
  protect,
};
