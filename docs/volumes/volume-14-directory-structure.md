# Volume 14: Directory Structure & Flow

To successfully build and maintain the CloudMart e-commerce platform, you must understand how the monorepo is structured and how data flows between different components.

This project is structured as an **NPM Workspace Monorepo**, meaning multiple independent Node.js projects live inside one git repository.

---

## 1. High-Level Monorepo Structure

At the root level of the repository, you will find these primary directories:

```text
cloudmart/
├── apps/               # React frontend applications (UI)
├── docs/               # Architecture documentation site
├── infrastructure/     # Terraform and Kubernetes manifests
├── packages/           # Shared Node.js libraries (used by multiple services)
├── services/           # The 9 independent Express.js microservices
├── docker-compose.yml  # Local development infrastructure runner
└── package.json        # Root workspace configuration
```

### Purpose of each root folder:
- **`apps/`**: Code that runs in the browser. Customer UI and Admin UI live here.
- **`services/`**: Code that runs on backend servers. Auth, Cart, Product, etc.
- **`packages/`**: To prevent copy-pasting the exact same code across 9 backend services, common logic is abstracted into independent packages. For example, the `shared-contracts` package contains the standard RabbitMQ event formats.

---

## 2. Microservice Internal Structure

Every microservice in the `services/` directory (e.g., `services/product-service`) follows a strict MVC-like structure for consistency. If you open a service, you will see:

```text
services/product-service/
├── src/
│   ├── controllers/      # Handles HTTP request/response logic
│   ├── middleware/       # Express middlewares (auth, validation, errors)
│   ├── models/           # Data definitions and DB interactions
│   └── routes/           # Maps HTTP verbs/URLs to controllers
├── .env.example          # Template for required environment variables
├── Dockerfile            # Instructions to containerize this service
├── index.js              # The main Express application entry point
└── package.json          # Service-specific dependencies
```

### The Request Lifecycle in a Service:
When a request hits a service, it follows this exact path:
1. **`index.js`**: Receives the request and routes it to `routes/`.
2. **`routes/*.js`**: Sees a `POST /items` and passes it through `middleware/validate.js` before sending it to the controller.
3. **`controllers/*.js`**: Extracts the data, and asks `models/` to save it.
4. **`models/*.js`**: Saves the data to Postgres/Redis, then returns success to the controller.
5. **`controllers/*.js`**: Sends the `201 Created` JSON response back to the client.

---

## 3. Data Flow: How Everything Connects

To understand how a feature works end-to-end, let's trace a user placing an order.

### Step 1: The User Interface (`apps/customer-ui`)
A user clicks "Checkout" on the React website. The frontend code triggers a `POST` request to `http://localhost:3001/api/orders`.

### Step 2: The API Gateway (`services/api-gateway`)
Port `3001` is the API Gateway. It acts as the traffic cop. It sees `/api/orders`, realizes this belongs to the **Order Service**, and proxies the HTTP request silently to port `3005`.

### Step 3: The Target Service (`services/order-service`)
The Order Service receives the HTTP request. It saves the pending order to its database. 
Because this is an event-driven system, it does **NOT** manually tell the Payment or Notification services what happened via HTTP. Instead, it emits an `OrderCreatedEvent` to RabbitMQ.

### Step 4: The Shared Contracts (`packages/shared-contracts`)
The Order Service imports the `OrderCreatedEvent` structure from `packages/shared-contracts` to ensure it formats the event exactly as the other services expect it. It pushes this event to the RabbitMQ Exchange.

### Step 5: The Consumers (`services/payment-service`, `services/notification-service`)
Both Payment and Notification services have queues bound to the RabbitMQ Exchange. 
- The **Payment Service** receives the event and charges the credit card via Stripe.
- The **Notification Service** receives the identical event simultaneously and sends an "Order Confirmation" email.

---

## 4. Key Takeaways for Developers

1. **Never communicate directly via HTTP between backend services** unless it is a strict synchronous requirement (like Gateway to Auth). Use RabbitMQ events to decouple them.
2. **Never duplicate event definitions.** If two services need to know about an event, define the structure in `packages/shared-contracts`.
3. **The Frontend only talks to the Gateway.** The React apps should never point to port `3002`, `3005`, etc. Only point them to the Gateway on `3001`.
