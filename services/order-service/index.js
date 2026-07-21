const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { createOrderCreatedEvent, Events } = require('@cloudmart/shared-contracts');

const app = express();
app.use(express.json());
app.use(cors());

const orders = [];

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service', timestamp: new Date().toISOString() });
});

app.post('/api/orders', (req, res) => {
  const { cartId, shippingAddressId, paymentMethodId } = req.body;
  
  if (!cartId || !shippingAddressId || !paymentMethodId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const orderId = `ord-${Math.floor(Math.random() * 1000000)}`;
  const newOrder = {
    orderId,
    status: 'PENDING_PAYMENT',
    totalAmount: 59.98, // Mocked for demo
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);

  // Publish to RabbitMQ (Mocking it for now since we don't have a real RabbitMQ connection in this demo file)
  const event = createOrderCreatedEvent({
    orderId,
    userId: 'user-abc123',
    email: 'nischal@cloudmart.dev',
    totalAmount: 59.98,
    items: [{ productId: 'prod-001', quantity: 2, price: 29.99 }],
    shippingAddress: { city: 'Kathmandu', country: 'Nepal' },
    paymentMethodId
  });

  console.log(`[RabbitMQ Mock] Published ${Events.ORDER_CREATED}:`, event.eventId);

  res.status(201).json(newOrder);
});

app.get('/api/orders', (req, res) => {
  res.json({ items: orders, total: orders.length });
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.orderId === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log('[order-service] running on port', PORT));
module.exports = app;
