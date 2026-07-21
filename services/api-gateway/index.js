const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Proxy Rules
const routes = {
  '/api/auth': process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
  '/api/products': process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003',
  '/api/cart': process.env.CART_SERVICE_URL || 'http://localhost:3004',
  '/api/orders': process.env.ORDER_SERVICE_URL || 'http://localhost:3005',
  '/api/payments': process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006',
  '/api/inventory': process.env.INVENTORY_SERVICE_URL || 'http://localhost:3007'
};

for (const [path, target] of Object.entries(routes)) {
  app.use(path, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { [`^${path}`]: path },
    logLevel: 'debug'
  }));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`[api-gateway] running on port ${PORT}`));
module.exports = app;
