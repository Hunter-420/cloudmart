const express = require('express');
const app = express();

// ---- Middleware ----
app.use(express.json());
app.use(require('cors')());

// ---- Health Check ----
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product-service', timestamp: new Date().toISOString() });
});

// ---- Routes ----
app.use('/api/products', require('./src/routes/product.routes'));

// ---- Error Handler (must be last) ----
app.use(require('./src/middleware/error.middleware'));

// ---- Start Server ----
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`[product-service] Running on port ${PORT}`);
});

module.exports = app;
