const prisma = require('../../prisma/client')
const { createOrderCreatedEvent, Events } = require('@cloudmart/shared-contracts')

const createOrder = async (req, res) => {
  const { cartId, shippingAddressId, paymentMethodId } = req.body

  if (!cartId || !shippingAddressId || !paymentMethodId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const orderId = `ord-${Math.floor(Math.random() * 1000000)}`
    const newOrder = await prisma.order.create({
      data: {
        orderId,
        status: 'PENDING_PAYMENT',
        totalAmount: 59.98,
        userId: req.user?.id || 'guest',
        email: req.user?.email || 'guest@example.com',
        shippingAddressId,
        paymentMethodId,
        items: {
          create: [{ productId: 'prod-001', quantity: 2, price: 29.99 }]
        }
      },
      include: { items: true }
    })

    const event = createOrderCreatedEvent({
      orderId,
      userId: newOrder.userId,
      email: newOrder.email,
      totalAmount: newOrder.totalAmount,
      items: newOrder.items,
      shippingAddress: { city: 'Kathmandu', country: 'Nepal' },
      paymentMethodId
    })

    console.log(`[RabbitMQ Mock] Published ${Events.ORDER_CREATED}:`, event.eventId)
    res.status(201).json(newOrder)
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
}

const getOrders = async (req, res) => {
  const items = await prisma.order.findMany({ include: { items: true } })
  res.json({ items, total: items.length })
}

const getOrderById = async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { orderId: req.params.id },
    include: { items: true }
  })
  if (!order) return res.status(404).json({ error: 'Order not found' })
  res.json(order)
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById
}
