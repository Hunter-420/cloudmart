// Global error handler middleware
// Must be registered LAST in Express with 4 arguments
const errorMiddleware = (err, req, res, next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;
