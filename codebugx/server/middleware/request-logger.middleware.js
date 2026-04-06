const logRequest = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const finishedAt = process.hrtime.bigint();
    const durationMs = Number(finishedAt - startedAt) / 1e6;

    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(
        2
      )}ms requestId=${req.requestId}`
    );
  });

  next();
};

module.exports = {
  logRequest,
};