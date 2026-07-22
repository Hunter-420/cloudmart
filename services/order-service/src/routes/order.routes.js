const express = require('express')
const router = express.Router()
const { authenticate } = require('@cloudmart/shared-middleware')
const orderController = require('../controllers/order.controller')

router.post('/', authenticate, orderController.createOrder)
router.get('/', authenticate, orderController.getOrders)

// Health check via API Gateway (/api/orders/health)
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'order-service',
    timestamp: new Date().toISOString()
  })
})

router.get('/:id', authenticate, orderController.getOrderById)

module.exports = router
