const express = require('express')
const cors = require('cors')

const orderRoutes = require('./src/routes/order.routes')

const app = express()
app.use(express.json())
app.use(cors())

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'order-service',
    timestamp: new Date().toISOString()
  })
})

app.use('/api/orders', orderRoutes)

module.exports = app
