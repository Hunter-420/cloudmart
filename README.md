# CloudMart E-Commerce Platform

A production-ready microservices e-commerce platform built for high scale, resiliency, and seamless team collaboration.

## Description
CloudMart is an enterprise-grade e-commerce backend built to demonstrate the power of microservices, event-driven architecture, and containerization. It comprises 9 independent services communicating asynchronously via RabbitMQ, all deployed on Azure Kubernetes Service (AKS).

This project was built in parallel by:
- [Nischal Khanal](https://www.khanalnischal.com.np) (Operations, Orchestration, Analytics)
- [Gajananda Mani Adhikari](https://github.com/GajanandaAdhikari) (Data, Users, Finance, Notifications)

## Core Problem
Building a large-scale e-commerce platform in a monolithic architecture often leads to deployment bottlenecks, tight coupling, and scaling issues during high-traffic events (like Black Friday sales). Furthermore, multiple developers working on the same codebase can easily block each other.

CloudMart solves this by:
1. **Decoupling Domains:** Splitting the system into 9 distinct microservices.
2. **Contract-First Development:** Defining API and Event shapes upfront so developers can build in parallel without stepping on each other's toes.
3. **Event-Driven Resilience:** Using RabbitMQ Pub/Sub (Fanout) so services like Notifications and Analytics can consume events without affecting critical paths like Payment processing.

## Technologies
Node.js, Express, React, Vite, PostgreSQL, Redis, RabbitMQ, Docker, Kubernetes, Terraform, Azure (AKS, ACR), GitHub Actions

## Content
- `apps/` - Contains the React frontend applications (`customer-ui`, `admin-ui`).
- `services/` - Contains the 9 backend microservices (`api-gateway`, `auth-service`, `product-service`, `cart-service`, `order-service`, `payment-service`, `inventory-service`, `notification-service`, `analytics-service`).
- `packages/` - Shared libraries for contracts and middleware.
- `infrastructure/` - Terraform and Kubernetes manifests for Azure deployment.
- `docs/` - Comprehensive documentation hub including API references, architecture volumes, and Postman collections.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Hunter-420/cloudmart.git
   cd ecommerce-platform
   ```

2. **Start Infrastructure (Local):**
   ```bash
   npm run infra:up
   ```

3. **Run Services:**
   You can run individual services using npm workspaces:
   ```bash
   npm run product-service
   ```
   Or run the entire suite via Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. **Documentation:**
   Open `docs/index.html` in your browser to view the complete architecture and API reference.
