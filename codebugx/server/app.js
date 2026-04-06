const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const apiRouter = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
const { assignRequestId } = require('./middleware/request-id.middleware');
const { logRequest } = require('./middleware/request-logger.middleware');

const app = express();

const baseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again shortly.',
  },
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many auth attempts. Please try again in a few minutes.',
  },
});

const analyzeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Analyze request limit reached. Please wait before submitting again.',
  },
});

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const localhostOriginPattern = /^http:\/\/localhost:\d+$/;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const isConfiguredOrigin = allowedOrigins.includes(origin);
    const isLocalDevOrigin = process.env.NODE_ENV !== 'production' && localhostOriginPattern.test(origin);

    if (isConfiguredOrigin || isLocalDevOrigin) {
      return callback(null, true);
    }

    const corsError = new Error('Origin not allowed by CORS policy');
    corsError.statusCode = 403;
    return callback(corsError);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(assignRequestId);
app.use(logRequest);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', baseLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/analyze', analyzeLimiter);

app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CodeBugX API is running',
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
