/**
 * @cloudmart/shared-contracts
 *
 * Centralized contract definitions for all RabbitMQ events and shared DTOs.
 * Both Nischal and Gajananda must import from here — never define event shapes
 * inline inside a service.
 *
 * Usage:
 *   const { Events, createOrderCreatedEvent } = require('@cloudmart/shared-contracts');
 */

// EVENT NAME CONSTANTS
const Events = {
  ORDER_CREATED: "OrderCreatedEvent",
  PAYMENT_SUCCESS: "PaymentSuccessEvent",
  PAYMENT_FAILED: "PaymentFailedEvent",
  STOCK_RESERVED: "StockReservedEvent",
  STOCK_RELEASED: "StockReleasedEvent",
  ORDER_SHIPPED: "OrderShippedEvent",
  USER_REGISTERED: "UserRegisteredEvent",
};

// EVENT FACTORIES
// These ensure every event has a consistent structure.

/**
 * @param {object} payload
 * @param {string} payload.orderId
 * @param {string} payload.userId
 * @param {string} payload.email
 * @param {number} payload.totalAmount
 * @param {Array<{productId: string, quantity: number, price: number}>} payload.items
 * @param {object} payload.shippingAddress
 * @param {string} payload.paymentMethodId
 */
const createOrderCreatedEvent = (payload) => ({
  eventType: Events.ORDER_CREATED,
  eventId: `evt-${Date.now()}`,
  timestamp: new Date().toISOString(),
  payload,
});

/**
 * @param {object} payload
 * @param {string} payload.orderId
 * @param {string} payload.paymentIntentId
 * @param {number} payload.amountCharged
 */
const createPaymentSuccessEvent = (payload) => ({
  eventType: Events.PAYMENT_SUCCESS,
  eventId: `evt-${Date.now()}`,
  timestamp: new Date().toISOString(),
  payload,
});

/**
 * @param {object} payload
 * @param {string} payload.orderId
 * @param {string} payload.reason
 */
const createPaymentFailedEvent = (payload) => ({
  eventType: Events.PAYMENT_FAILED,
  eventId: `evt-${Date.now()}`,
  timestamp: new Date().toISOString(),
  payload,
});

/**
 * @param {object} payload
 * @param {string} payload.userId
 * @param {string} payload.email
 * @param {string} payload.firstName
 */
const createUserRegisteredEvent = (payload) => ({
  eventType: Events.USER_REGISTERED,
  eventId: `evt-${Date.now()}`,
  timestamp: new Date().toISOString(),
  payload,
});

// QUEUE / EXCHANGE NAMES
const Queues = {
  ORDER_EVENTS: "cloudmart.orders",
  PAYMENT_EVENTS: "cloudmart.payments",
  NOTIFICATION_EVENTS: "cloudmart.notifications",
  ANALYTICS_EVENTS: "cloudmart.analytics",
};

const Exchange = {
  MAIN: "cloudmart.events",
};

module.exports = {
  Events,
  Queues,
  Exchange,
  createOrderCreatedEvent,
  createPaymentSuccessEvent,
  createPaymentFailedEvent,
  createUserRegisteredEvent,
};
