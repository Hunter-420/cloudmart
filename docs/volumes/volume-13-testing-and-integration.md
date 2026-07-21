# Volume 13: Local Testing, Authentication Mocking, & Frontend Integration

When developing a microservice architecture in parallel, teams need clear strategies to test their services in isolation without being blocked by dependencies (like Auth or Frontend apps). 

This document outlines the standard CloudMart procedures for isolated testing, bypassing authentication barriers during development, and eventually integrating services into the front-end apps.

---

## 1. Testing Individual Services Independently

You do **not** need the whole ecosystem running to test one service.

### Step 1: Start Core Infrastructure
At a minimum, you usually need a database, Redis, and RabbitMQ. We run these via Docker:
```bash
# Run from the repository root
npm run infra:up
```
*(This starts PostgreSQL, RabbitMQ, and Redis in the background).*

### Step 2: Start Your Target Service
Open a new terminal and run only the service you are actively building:
```bash
npm run product-service 
# or: cd services/product-service && npm run dev
```

### Step 3: Use the Postman / REST Client
We have provided two pre-built testing suites in the `docs/` folder:
1. **VS Code REST Client:** Open `docs/requests/cloudmart-all-services.http`. You can click "Send Request" directly inside VS Code to ping your service (e.g., `http://localhost:3003/api/products`).
2. **Postman:** Import `docs/CloudMart_Postman_Collection.json`. You can trigger any route manually.

---

## 2. Bypassing Authentication for Local Development

When Gajananda is building the Auth Service, Nischal shouldn't be blocked from building the Order Service just because he can't get a valid JWT token. 

### Strategy A: The "Development Mode" Auth Bypass
In our shared middleware, we implement a check for the `NODE_ENV`. If the environment is `development`, we allow a static "dev token" to bypass validation.

For example, when validating a token in `Order Service`:
```javascript
// Example Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  // DEV BYPASS: Allow 'dev-token' in local development
  if (process.env.NODE_ENV === 'development' && token === 'dev-token') {
    req.user = { id: 'dev-user-123', email: 'dev@cloudmart.dev', roles: ['admin'] };
    return next();
  }

  // Real JWT validation logic follows...
  // jwt.verify(...)
};
```
**How to use it:** In Postman, just set your Bearer Token to literally `dev-token`. You will be authenticated as a mock user.

### Strategy B: Mocking Headers Locally
If a service expects a user ID to come from the API Gateway (often the API Gateway verifies the JWT and forwards the `X-User-Id` header to backend services), you can simply inject that header directly in Postman during isolated testing:
- Header: `X-User-Id: dev-user-123`

---

## 3. Frontend App Integration (Customer UI & Admin UI)

Eventually, the React apps need to talk to the backend. **The apps should NEVER talk directly to individual microservices.** They must always route through the **API Gateway (Port 3001)**.

### How it works:
1. The frontend (`apps/customer-ui`) makes an API request to `http://localhost:3001/api/products`.
2. The **API Gateway** intercepts this, checks its routing rules, and proxies the request silently to the internal Product Service on port 3003.

### Implementation Steps:

**1. Set the API Base URL**
In `apps/customer-ui/src/services/api.js`, the base URL must point to the Gateway:
```javascript
// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getProducts = () => fetch(`${API_URL}/api/products`);
export const login = (data) => fetch(`${API_URL}/api/auth/login`, { ... });
```

**2. Pass the Auth Token**
When the user logs in, the Auth Service returns a JWT. The frontend stores this in `localStorage` and appends it to subsequent requests:
```javascript
// src/services/api.js
const fetchWithAuth = (path, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  return fetch(`${API_URL}${path}`, { ...options, headers });
};
```

**3. Run the Integration Test Locally**
To test the full flow locally:
1. Start infrastructure: `npm run infra:up`
2. Start Gateway: `cd services/api-gateway && npm run dev`
3. Start Target Service: `cd services/product-service && npm run dev`
4. Start UI: `cd apps/customer-ui && npm run dev`

The UI (Port 5173) will hit the Gateway (Port 3001), which proxies to the Product Service (Port 3003).
