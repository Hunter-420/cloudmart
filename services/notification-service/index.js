const express = require('express');
const { Events } = require('@cloudmart/shared-contracts');

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service', timestamp: new Date().toISOString() });
});

// Mocking the RabbitMQ consumer
console.log('[notification-service] Listening for events (mock)');
setTimeout(() => {
  console.log(`[notification-service] Consuming ${Events.ORDER_CREATED}... Sending email to user.`);
}, 5000);

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => console.log('[notification-service] running on port', PORT));
module.exports = app;
