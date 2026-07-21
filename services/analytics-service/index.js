const express = require('express');
const { Events } = require('@cloudmart/shared-contracts');

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'analytics-service', timestamp: new Date().toISOString() });
});

// Mocking the RabbitMQ consumer
console.log('[analytics-service] Listening for events (mock)');
setTimeout(() => {
  console.log(`[analytics-service] Consuming ${Events.ORDER_CREATED}... Updating sales dashboard metrics.`);
}, 6000);

const PORT = process.env.PORT || 3009;
app.listen(PORT, () => console.log('[analytics-service] running on port', PORT));
module.exports = app;
