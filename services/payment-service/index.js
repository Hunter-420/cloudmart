const express = require('express');
const cors = require('cors');
const { createPaymentSuccessEvent, Events } = require('@cloudmart/shared-contracts');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment-service', timestamp: new Date().toISOString() });
});

app.post('/api/payments/webhook', (req, res) => {
  // Mock Stripe webhook
  const { type, data } = req.body;
  if (type === 'payment_intent.succeeded') {
    const orderId = data.object.metadata.orderId;
    const amount = data.object.amount;
    
    // Publish mock event
    const event = createPaymentSuccessEvent({
      orderId,
      paymentIntentId: data.object.id,
      amountCharged: amount
    });
    
    console.log(`[RabbitMQ Mock] Published ${Events.PAYMENT_SUCCESS}:`, event.eventId);
  }
  
  res.json({ received: true });
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log('[payment-service] running on port', PORT));
module.exports = app;
