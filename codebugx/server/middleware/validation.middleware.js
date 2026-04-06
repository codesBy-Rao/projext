const allowedLanguages = new Set(['javascript', 'typescript', 'python', 'java']);

const createValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const validateAuthPayload = (req, res, next) => {
  const { email, password } = req.body || {};

  if (email === undefined || password === undefined) {
    return next(createValidationError('email and password are required'));
  }

  if (typeof email !== 'string') {
    return next(createValidationError('email must be a string'));
  }

  if (typeof password !== 'string') {
    return next(createValidationError('password must be a string'));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(normalizedEmail)) {
    return next(createValidationError('Please provide a valid email address'));
  }

  if (password.length < 8) {
    return next(createValidationError('Password must be at least 8 characters long'));
  }

  req.body.email = normalizedEmail;
  req.body.password = password;
  return next();
};

const validateAnalyzePayload = (req, res, next) => {
  const { codeSnippet, language } = req.body || {};

  if (codeSnippet === undefined || language === undefined) {
    return next(createValidationError('codeSnippet and language are required'));
  }

  if (typeof codeSnippet !== 'string' || !codeSnippet.trim()) {
    return next(createValidationError('codeSnippet must be a non-empty string'));
  }

  if (codeSnippet.length > 20000) {
    return next(createValidationError('codeSnippet is too large (max 20000 chars)'));
  }

  if (typeof language !== 'string' || !allowedLanguages.has(language.toLowerCase())) {
    return next(createValidationError('language must be one of: javascript, typescript, python, java'));
  }

  req.body.codeSnippet = codeSnippet;
  req.body.language = language.toLowerCase();
  return next();
};

const validatePaginationQuery = (req, res, next) => {
  const { page, limit } = req.query || {};

  if (page !== undefined) {
    const pageNumber = Number(page);
    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      return next(createValidationError('page must be a positive integer'));
    }
  }

  if (limit !== undefined) {
    const limitNumber = Number(limit);
    if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 50) {
      return next(createValidationError('limit must be an integer between 1 and 50'));
    }
  }

  return next();
};

module.exports = {
  validateAuthPayload,
  validateAnalyzePayload,
  validatePaginationQuery,
};
