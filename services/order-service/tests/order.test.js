const request = require('supertest')
const app = require('../index')

// Mock Prisma
const prisma = require('../prisma/client')
jest.mock('../prisma/client', () => require('jest-mock-extended').mockDeep())

describe('Order Service API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/orders', () => {
    it('should reject requests without authentication', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ cartId: '1', shippingAddressId: '2', paymentMethodId: '3' })

      expect(res.statusCode).toBe(401)
    })

    it('should create an order when authenticated with dev-token', async () => {
      prisma.order.create.mockResolvedValue({
        orderId: 'ord-123',
        status: 'PENDING_PAYMENT',
        userId: 'dev-user-123',
        totalAmount: 59.98
      })

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer dev-token')
        .send({
          cartId: 'cart-1',
          shippingAddressId: 'addr-1',
          paymentMethodId: 'pm-1'
        })

      expect(res.statusCode).toBe(201)
      expect(res.body).toHaveProperty('orderId')
      expect(res.body.status).toBe('PENDING_PAYMENT')
      expect(res.body.userId).toBe('dev-user-123')
    })

    it('should reject if missing required fields', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer dev-token')
        .send({ cartId: 'cart-1' }) // missing other fields

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('error')
    })
  })

  describe('GET /api/orders', () => {
    it('should fetch orders for authenticated user', async () => {
      prisma.order.findMany.mockResolvedValue([
        { orderId: 'ord-123', status: 'PENDING_PAYMENT' }
      ])

      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', 'Bearer dev-token')

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('items')
      expect(Array.isArray(res.body.items)).toBe(true)
    })
  })
})
