const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Mock inventory db
const inventory = {
  'prod-001': { availableStock: 150, reservedStock: 0 },
  'prod-002': { availableStock: 60, reservedStock: 0 },
  'prod-003': { availableStock: 200, reservedStock: 0 }
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'inventory-service', timestamp: new Date().toISOString() });
});

app.get('/api/inventory/:productId', (req, res) => {
  const stock = inventory[req.params.productId] || { availableStock: 0, reservedStock: 0 };
  res.json({
    productId: req.params.productId,
    availableStock: stock.availableStock,
    reservedStock: stock.reservedStock,
    totalStock: stock.availableStock + stock.reservedStock
  });
});

app.post('/api/inventory/reserve', (req, res) => {
  const { orderId, items } = req.body;
  if (!orderId || !items) return res.status(400).json({ error: 'Missing required fields' });

  // Basic mock reservation logic
  for (const item of items) {
    const stock = inventory[item.productId];
    if (!stock || stock.availableStock < item.quantity) {
      return res.status(422).json({
        error: `Insufficient stock for product ${item.productId}`,
        available: stock ? stock.availableStock : 0,
        requested: item.quantity
      });
    }
  }

  // Apply reservation
  for (const item of items) {
    inventory[item.productId].availableStock -= item.quantity;
    inventory[item.productId].reservedStock += item.quantity;
  }

  res.json({
    success: true,
    reservationId: `res-${Math.floor(Math.random() * 10000)}`,
    reservedUntil: new Date(Date.now() + 15 * 60000).toISOString() // 15 mins
  });
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => console.log('[inventory-service] running on port', PORT));
module.exports = app;
