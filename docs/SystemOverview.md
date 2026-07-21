# CloudMart System Overview

## Request Flow Example: Creating an Order

1. **Customer Web UI** sends a POST request to `api-gateway`.
2. **API Gateway** validates the JWT token with `auth-service`.
3. If valid, the gateway routes the request to `order-service`.
4. **Order Service** creates the order in its database (PostgreSQL).
5. **Order Service** reserves stock via `inventory-service`.
6. **Order Service** publishes an `OrderCreatedEvent` to **RabbitMQ**.
7. **Payment Service** and **Notification Service** independently consume this event.
8. **Payment Service** processes payment and updates its database.
9. **Notification Service** sends a confirmation email to the user.

## Parallel Development Flow (Contract-First)

- Both developers agree on the OpenAPI specifications (`docs/api-specs/`) and RabbitMQ event schemas (`packages/shared-contracts`).
- Developer 1 builds the `order-service`, utilizing mock HTTP responses or mock RabbitMQ messages to simulate the payment service.
- Developer 2 builds the `payment-service`, testing it by manually publishing `OrderCreatedEvent` payloads to RabbitMQ.
