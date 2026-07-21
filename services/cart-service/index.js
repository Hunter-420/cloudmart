const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

// In-memory cart store: cartId -> { cartId, totalAmount, items: [] }
const carts = {};

const getUserId = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return 'anon-' + Math.random().toString(36).substring(7);
  // Simple extraction for demo (in reality, decode JWT)
  return 'user-abc123';
};

const getOrCreateCart = (userId) => {
  const cartId = `cart-${userId}`;
  if (!carts[cartId]) {
    carts[cartId] = { cartId, totalAmount: 0, items: [] };
  }
  return carts[cartId];
};

const calculateTotal = (cart) => {
  cart.totalAmount = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cart-service', timestamp: new Date().toISOString() });
});

app.get('/api/cart', (req, res) => {
  const cart = getOrCreateCart(getUserId(req));
  res.json(cart);
});

app.post('/api/cart/items', (req, res) => {
  const { productId, quantity, price = 29.99 } = req.body; // mocking price lookup for demo
  const cart = getOrCreateCart(getUserId(req));
  
  const existingItem = cart.items.find(i => i.productId === productId);
  if (existingItem) {
    existingItem.quantity = quantity;
  } else {
    cart.items.push({ productId, quantity, price });
  }
  
  calculateTotal(cart);
  res.json(cart);
});

app.delete('/api/cart/items/:productId', (req, res) => {
  const cart = getOrCreateCart(getUserId(req));
  cart.items = cart.items.filter(i => i.productId !== req.params.productId);
  calculateTotal(cart);
  res.status(204).send();
});

app.delete('/api/cart', (req, res) => {
  const cartId = `cart-${getUserId(req)}`;
  delete carts[cartId];
  res.status(204).send();
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log('[cart-service] running on port', PORT));
module.exports = app;
