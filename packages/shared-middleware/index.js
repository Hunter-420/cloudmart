/**
 * @cloudmart/shared-middleware
 *
 * Reusable Express.js middleware for all CloudMart services.
 * Import and use in any service to keep middleware logic consistent.
 *
 * Usage:
 *   const { errorHandler, requestLogger, notFound } = require('@cloudmart/shared-middleware');
 *   app.use(requestLogger);
 *   app.use(notFound);
 *   app.use(errorHandler); // must be last
 */

/**
 * Request logger - logs method, path, and response time for every request.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const correlationId = req.headers['x-correlation-id'] || '-';
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms | corr-id: ${correlationId}`);
  });
  next();
};

/**
 * 404 handler - call after all routes are registered.
 */
const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};

/**
 * Global error handler - must be registered as the LAST middleware (4 args).
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message, err.stack);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { requestLogger, notFound, errorHandler };
