const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * 
 * Strategy A: Local Development Bypass
 * Strategy B: Gateway Forwarding
 * Strategy C: Real JWT Verification
 */
const authenticate = (req, res, next) => {
  const env = process.env.NODE_ENV || 'development';
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  // Strategy B: X-User-Id forwarded from API Gateway (Internal Service Communication)
  if (req.headers['x-user-id']) {
    req.user = {
      id: req.headers['x-user-id'],
      email: req.headers['x-user-email'] || 'forwarded@cloudmart.dev',
      roles: (req.headers['x-user-roles'] || 'user').split(',')
    };
    return next();
  }

  // Strategy A: Local Dev Bypass
  if ((env === 'development' || env === 'test') && token === 'dev-token') {
    req.user = {
      id: 'dev-user-123',
      email: 'dev@cloudmart.dev',
      roles: ['admin', 'user']
    };
    return next();
  }

  // Strategy C: Real JWT Verification
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = { authenticate };
