# Volume 3: Microservice Architecture Deep Dive

## The Purpose of This Volume

This volume provides exhaustive documentation for every microservice in the CloudMart platform. While Volume 2 showed the system from above, this volume goes inside each service to reveal its internal structure, design decisions, and implementation patterns. Each service is documented with the same comprehensive structure so I can compare approaches and understand how patterns apply consistently across the platform.

The services covered are: API Gateway, Auth Service, User Service, Product Service, Cart Service, Order Service, Payment Service, Inventory Service, Notification Service, and Analytics Service. Each service includes its purpose, responsibilities, internal layers, folder structure, API design, database design, message flow, events, dependencies, communication patterns, scaling strategy, security considerations, failure scenarios, deployment strategy, observability, testing strategy, versioning approach, and future improvements.

This volume serves as both design documentation and implementation guide. When I sit down to write code for a service, this document tells me exactly what to build and why.

---

## Detailed Table of Contents

1. API Gateway Service
   1.1 Purpose and Responsibilities
   1.2 Internal Architecture
   1.3 Folder Structure
   1.4 API Design
   1.5 Message Flow
   1.6 Dependencies and Communication
   1.7 Scaling Strategy
   1.8 Security
   1.9 Failure Scenarios
   1.10 Deployment
   1.11 Observability
   1.12 Testing
   1.13 Versioning
   1.14 Future Improvements

2. Auth Service
   2.1 Purpose and Responsibilities
   2.2 Internal Architecture
   2.3 Folder Structure
   2.4 API Design
   2.5 Database Design
   2.6 Message Flow
   2.7 Dependencies and Communication
   2.8 Scaling Strategy
   2.9 Security
   2.10 Failure Scenarios
   2.11 Deployment
   2.12 Observability
   2.13 Testing
   2.14 Versioning
   2.15 Future Improvements

3. User Service
   3.1 through 3.15 (same structure)

4. Product Service
   4.1 through 4.15

5. Cart Service
   5.1 through 5.15

6. Order Service
   6.1 through 6.15

7. Payment Service
   7.1 through 7.15

8. Inventory Service
   8.1 through 8.15

9. Notification Service
   9.1 through 9.15

10. Analytics Service
    10.1 through 10.15

11. Shared Patterns
    11.1 Clean Architecture
    11.2 MediatR Pattern
    11.3 Repository Pattern
    11.4 Outbox Pattern
    11.5 Event Sourcing Considerations
    11.6 API Versioning Strategy
    11.7 Cross Cutting Concerns

---

## 1. API Gateway Service

### 1.1 Purpose and Responsibilities

The API Gateway is the single entry point for all client requests to the CloudMart platform. Every request from web browsers, mobile applications, and external integrators passes through this service. Its primary purpose is to simplify the client experience by providing a unified API while handling cross cutting concerns that would otherwise need to be duplicated in every downstream service.

The responsibilities include request routing to appropriate microservices, authentication validation through JWT token verification, rate limiting to prevent abuse and ensure fair resource usage, request/response transformation for protocol adaptation, SSL termination at the edge, CORS handling for cross origin requests, response caching for frequently accessed data, request logging for audit trails, and health check aggregation for the entire platform.

The API Gateway implements the Backend for Frontend pattern. This means it can provide tailored responses for different client types. The customer web application receives responses optimized for product browsing and checkout. The admin dashboard receives responses optimized for data tables and analytics. A future mobile application could receive responses optimized for smaller payloads and slower networks.

### 1.2 Internal Architecture

The API Gateway uses YARP (Yet Another Reverse Proxy) from Microsoft. YARP is a highly customizable reverse proxy library built on ASP.NET Core. Unlike heavyweight API gateway products that require separate infrastructure, YARP runs as a standard ASP.NET Core application within our Kubernetes cluster. This keeps the deployment simple and the resource footprint small.

The internal pipeline processes requests in this order: request arrives at the ingress controller and is forwarded to the gateway, the correlation ID middleware extracts or generates a unique identifier for distributed tracing, the logging middleware records the incoming request with method, path, and headers, the CORS middleware validates the origin and adds appropriate headers, the authentication middleware extracts the JWT bearer token and validates its signature against Azure AD B2C public keys, the rate limiting middleware checks if the client has exceeded their quota, the routing middleware matches the request path to configured routes, transformation middleware modifies headers or body if needed, the request is proxied to the target service, the response passes through transformation middleware if configured, caching middleware stores the response if cacheable, the response returns to the client, and the logging middleware records the response status and duration.

### 1.3 Folder Structure

```
src/CloudMart.ApiGateway/
├── CloudMart.ApiGateway.csproj
├── Program.cs
├── appsettings.json
├── appsettings.Development.json
├── Configuration/
│   ├── RouteConfig.cs          # YARP route definitions
│   ├── ClusterConfig.cs        # Backend cluster definitions
│   └── TransformConfig.cs      # Request/response transforms
├── Middleware/
│   ├── CorrelationIdMiddleware.cs
│   ├── RequestLoggingMiddleware.cs
│   └── ResponseCachingMiddleware.cs
├── Authentication/
│   ├── JwtValidationService.cs
│   └── ClaimsTransformer.cs
├── RateLimiting/
│   ├── RateLimitConfiguration.cs
│   └── CustomRateLimitPolicy.cs
├── Health/
│   ├── CompositeHealthCheck.cs
│   └── DownstreamHealthCheck.cs
├── appsettings.json            # YARP configuration section
└── Dockerfile
```

### 1.4 API Design

The API Gateway does not expose its own API endpoints in the traditional sense. Instead, it routes requests based on path prefixes: /api/auth routes to the Auth Service, /api/users routes to the User Service, /api/products routes to the Product Service, /api/cart routes to the Cart Service, /api/orders routes to the Order Service, /api/payments routes to the Payment Service, /api/inventory routes to the Inventory Service, /api/notifications routes to the Notification Service, and /api/analytics routes to the Analytics Service.

The gateway does expose these direct endpoints: GET /health returns the composite health status of all downstream services, GET /health/live returns the gateway's own liveness status, GET /metrics returns Prometheus format metrics for scraping, and GET /version returns the current deployment version.

### 1.5 Message Flow

The API Gateway handles only synchronous HTTP traffic. It does not participate in asynchronous messaging. When a request arrives, the gateway performs its middleware processing and then forwards the request to the target service via HTTP. The response flows back through the same pipeline in reverse.

A typical request flow: client sends GET /api/products?page=1, the ingress controller routes to the gateway pod, the gateway extracts the correlation ID from headers or generates a new GUID, the gateway validates the JWT token if present, the gateway checks rate limits for the client IP and user ID, the gateway matches the path /api/products to the Product Service cluster, the gateway proxies the request to http://product-service:8080/api/products?page=1, the Product Service processes the request and returns a response, the gateway applies any response transformations, the gateway adds the correlation ID to response headers, and the response returns to the client.

### 1.6 Dependencies and Communication

The API Gateway depends on all downstream services but communicates only via HTTP. It does not hold state in a database. Configuration comes from appsettings.json and environment variables. For service discovery, it uses Kubernetes DNS names like http://product-service:8080 rather than IP addresses. These DNS names are stable even as pods are recreated.

The gateway reads Azure AD B2C public keys from the discovery endpoint at startup and refreshes them periodically. These keys are cached in memory to avoid fetching them on every request.

### 1.7 Scaling Strategy

The API Gateway is stateless and scales horizontally. It runs 3 replicas minimum for high availability. During traffic spikes, the Horizontal Pod Autoscaler increases replicas based on CPU utilization above 70% or request rate above 1000 requests per second per pod. The maximum replica count is 20.

Because the gateway is stateless, any pod can handle any request. Session affinity is not required because authentication uses JWT tokens that are self contained.

### 1.8 Security

Security is a primary responsibility of the gateway. JWT validation uses RS256 signature verification with public keys from Azure AD B2C. Tokens must not be expired and must have valid issuer and audience claims. Rate limiting uses a token bucket algorithm allowing 100 requests per minute for anonymous users and 1000 requests per minute for authenticated users. IP-based blocking prevents known malicious IPs from reaching backend services. Response headers include strict transport security, content security policy, and frame options. Request size limits prevent large payloads from consuming resources.

### 1.9 Failure Scenarios

If a downstream service is unhealthy, the gateway removes it from the rotation based on health check failures. If all instances of a service are unhealthy, the gateway returns a 503 Service Unavailable with a retry-after header. If a request times out after 30 seconds, the gateway returns a 504 Gateway Timeout. If rate limiting triggers, the gateway returns 429 Too Many Requests with rate limit headers. If JWT validation fails, the gateway returns 401 Unauthorized. If the gateway itself fails, Kubernetes restarts the pod automatically.

### 1.10 Deployment

The gateway deploys as a Kubernetes Deployment with 3 replicas. It uses a RollingUpdate strategy with maxSurge of 1 and maxUnavailable of 0 for zero downtime deployments. The service exposes port 8080 for HTTP traffic. The ingress controller routes external traffic to this service.

### 1.11 Observability

Every request is logged with correlation ID, method, path, status code, and duration. These logs go to stdout where Fluentd collects them for Azure Log Analytics. Metrics include request count by path and status, request duration histograms, active connections, and rate limiting hits. Prometheus scrapes these metrics every 15 seconds. Health check status for each downstream service is exposed for monitoring dashboards.

### 1.12 Testing

Unit tests cover middleware behavior using the ASP.NET Core TestHost. Integration tests verify routing configuration using an in memory setup. Load tests using k6 simulate 1000 concurrent users to verify rate limiting and performance. Contract tests verify that downstream services respond as expected to proxied requests.

### 1.13 Versioning

The gateway configuration is versioned with the deployment. Route changes require a new deployment. The gateway itself follows semantic versioning. Version 1.0.0 is the initial release. Breaking changes like route path modifications require a major version bump.

### 1.14 Future Improvements

Future improvements include request/response transformation using a DSL for flexible protocol adaptation, WebSocket support for real time features like live inventory updates, request body caching for POST requests that are idempotent, and traffic shadowing to send production traffic to new service versions without affecting users.

---

## 2. Auth Service

### 2.1 Purpose and Responsibilities

The Auth Service handles customer authentication and authorization for the CloudMart platform. While Azure AD B2C manages the actual identity directory and login flows, the Auth Service provides the application layer integration. It handles registration coordination with B2C, token exchange and refresh, claims enrichment with application specific roles and permissions, session management through Redis, and logout coordination across all sessions.

### 2.2 Internal Architecture

The Auth Service follows Clean Architecture with clear separation of concerns. The API layer contains ASP.NET Core controllers that receive HTTP requests. The application layer contains MediatR command and query handlers that implement business logic. The domain layer contains entities, value objects, and domain events. The infrastructure layer contains database access, external service clients, and caching implementations.

### 2.3 Folder Structure

```
src/CloudMart.AuthService/
├── CloudMart.AuthService.csproj
├── Program.cs
├── appsettings.json
├── Domain/
│   ├── Entities/
│   │   ├── UserAccount.cs
│   │   ├── UserProfile.cs
│   │   └── RefreshToken.cs
│   ├── ValueObjects/
│   │   ├── Email.cs
│   │   └── PasswordHash.cs
│   └── Events/
│       └── UserRegisteredEvent.cs
├── Application/
│   ├── Commands/
│   │   ├── RegisterUserCommand.cs
│   │   ├── LoginCommand.cs
│   │   ├── RefreshTokenCommand.cs
│   │   └── LogoutCommand.cs
│   ├── Queries/
│   │   └── GetUserProfileQuery.cs
│   ├── Handlers/
│   │   ├── RegisterUserHandler.cs
│   │   ├── LoginHandler.cs
│   │   ├── RefreshTokenHandler.cs
│   │   └── LogoutHandler.cs
│   ├── DTOs/
│   │   ├── AuthResponseDto.cs
│   │   ├── UserProfileDto.cs
│   │   └── TokenPairDto.cs
│   └── Validators/
│       └── AuthRequestValidator.cs
├── Infrastructure/
│   ├── Persistence/
│   │   ├── AuthDbContext.cs
│   │   ├── Configurations/
│   │   └── Migrations/
│   ├── Services/
│   │   ├── B2CIdentityService.cs
│   │   ├── TokenService.cs
│   │   └── PasswordService.cs
│   └── Repositories/
│       └── UserRepository.cs
├── API/
│   ├── Controllers/
│   │   └── AuthController.cs
│   ├── Middleware/
│   │   └── AuthExceptionMiddleware.cs
│   └── Models/
│       ├── RegisterRequest.cs
│       ├── LoginRequest.cs
│       └── RefreshRequest.cs
├── appsettings.json
└── Dockerfile
```

### 2.4 API Design

POST /api/auth/register: Creates a new user account. Request body includes email, password, firstName, lastName, and phone. Password must be at least 8 characters with uppercase, lowercase, digit, and special character. The service creates the user in Azure AD B2C and stores profile data in the local database. Returns 201 Created with the user ID and a message to check email for verification.

POST /api/auth/login: Authenticates a user and issues tokens. Request body includes email and password. The service validates credentials against B2C and returns an access token and refresh token pair. The access token is a JWT valid for 15 minutes. The refresh token is a random GUID valid for 7 days, stored in the database for revocation capability.

POST /api/auth/refresh: Issues a new access token using a valid refresh token. Request body includes refreshToken. The service validates the refresh token against the database, checks it has not been revoked, and issues a new token pair. The old refresh token is invalidated to prevent reuse.

POST /api/auth/logout: Revokes the current session. The refresh token is marked as revoked in the database. The access token is added to a Redis blocklist with TTL matching the token expiry. Subsequent requests with this token will be rejected.

GET /api/auth/me: Returns the current user's profile. Requires a valid access token. Returns user ID, email, first name, last name, phone, and roles.

### 2.5 Database Design

The Auth Service uses Azure SQL Database with the following tables: UserAccounts stores the mapping between B2C object IDs and application user IDs with columns Id, B2CObjectId, Email, CreatedAt, UpdatedAt, and IsActive. UserProfiles stores extended profile information with columns Id, UserAccountId, FirstName, LastName, Phone, DateOfBirth, and Preferences as JSON. RefreshTokens stores issued refresh tokens with columns Id, TokenHash, UserAccountId, IssuedAt, ExpiresAt, RevokedAt, and ReplacedByTokenId. UserRoles stores role assignments with columns UserAccountId, Role, and AssignedAt.

### 2.6 Message Flow

When a user registers, the Auth Service creates the account in Azure AD B2C through Microsoft Graph API. After successful creation, it stores the profile in the local database. Then it publishes a UserRegisteredEvent to Service Bus. The Notification Service consumes this event to send a welcome email. The Analytics Service consumes this event to update user acquisition metrics.

When a user logs in, the service exchanges credentials with B2C for tokens. It then looks up the user's profile and roles from the local database. The access token includes the B2C object ID as the subject claim and application roles as custom claims.

### 2.7 Dependencies and Communication

The Auth Service depends on Azure AD B2C for identity verification, Azure SQL Database for profile storage, Redis for token blocklist and session caching, and Azure Service Bus for publishing domain events. It communicates with B2C via the Microsoft Graph API using a managed identity. Database access uses Entity Framework Core with connection strings stored in Key Vault.

### 2.8 Scaling Strategy

The Auth Service runs 2 replicas minimum. Authentication is relatively low frequency compared to product browsing. Scaling triggers at 70% CPU or 100 concurrent login attempts per second. The service is stateless except for the database, so horizontal scaling works without session affinity.

### 2.9 Security

Passwords are never stored in the application database. B2C handles password hashing using bcrypt with adaptive cost factor. Refresh tokens are hashed with SHA256 before storage to prevent database leaks from exposing valid tokens. The token blocklist in Redis uses sliding expiration. Rate limiting on login endpoints prevents brute force attacks: 5 attempts per IP per minute, with progressive delays after failures.

### 2.10 Failure Scenarios

If B2C is unavailable, login and registration fail with a 503 status. Users cannot authenticate until B2C recovers. If the database is unavailable, token refresh fails because the service cannot validate refresh tokens. Cached user profiles in Redis allow read operations to continue briefly. If Redis is unavailable, logout token blocklist fails, meaning revoked tokens might be accepted until Redis recovers.

### 2.11 Deployment

The Auth Service deploys as a Kubernetes Deployment with 2 replicas. Database migrations run as an init container before the application starts. The service uses a ClusterIP service for internal communication.

### 2.12 Observability

Metrics include login success/failure rates, registration conversion rate, token refresh rate, and session duration. Alerts trigger on login failure rate above 10% or registration error rate above 5%. Logs include all authentication attempts with outcome for security auditing.

### 2.13 Testing

Unit tests cover password validation, token generation, and claims transformation. Integration tests verify B2C interaction using a test B2C tenant. Contract tests verify the API responses match expected schemas. Security tests verify rate limiting and brute force protection.

### 2.14 Versioning

The Auth Service API follows semantic versioning. Version 1.0.0 supports email/password authentication. Future versions may add social login endpoints and multi factor authentication flows.

### 2.15 Future Improvements

Future improvements include social login integration for Google, Facebook, and Apple, multi factor authentication using SMS and authenticator apps, passwordless login using magic links, and account linking for users with multiple login methods.

---

## 3. User Service

### 3.1 Purpose and Responsibilities

The User Service manages customer profiles, addresses, and preferences. It is separate from the Auth Service because authentication and user data have different access patterns and lifecycles. Authentication is read heavy and performance critical. User profile management is read/write balanced and less latency sensitive. Separating them allows independent scaling and reduces the blast radius of changes.

Responsibilities include profile CRUD operations, shipping and billing address management, notification preference management, account deactivation and GDPR deletion requests, and profile data enrichment for analytics.

### 3.2 Internal Architecture

The User Service follows the same Clean Architecture pattern as the Auth Service. Controllers receive HTTP requests and dispatch MediatR commands or queries. Handlers contain business logic. Repositories abstract database access. Domain events are published through the outbox pattern for reliable delivery.

### 3.3 Folder Structure

```
src/CloudMart.UserService/
├── CloudMart.UserService.csproj
├── Program.cs
├── appsettings.json
├── Domain/
│   ├── Entities/
│   │   ├── UserProfile.cs
│   │   ├── Address.cs
│   │   └── NotificationPreferences.cs
│   ├── ValueObjects/
│   │   ├── FullName.cs
│   │   └── PhoneNumber.cs
│   └── Events/
│       ├── ProfileUpdatedEvent.cs
│       ├── AddressAddedEvent.cs
│       └── AccountDeletedEvent.cs
├── Application/
│   ├── Commands/
│   │   ├── CreateProfileCommand.cs
│   │   ├── UpdateProfileCommand.cs
│   │   ├── AddAddressCommand.cs
│   │   ├── UpdatePreferencesCommand.cs
│   │   └── DeleteAccountCommand.cs
│   ├── Queries/
│   │   ├── GetProfileQuery.cs
│   │   ├── GetAddressesQuery.cs
│   │   └── GetPreferencesQuery.cs
│   ├── Handlers/
│   ├── DTOs/
│   └── Validators/
├── Infrastructure/
│   ├── Persistence/
│   │   ├── UserDbContext.cs
│   │   └── Migrations/
│   ├── Repositories/
│   │   └── UserRepository.cs
│   └── Services/
│       └── EventPublisher.cs
├── API/
│   ├── Controllers/
│   │   └── UsersController.cs
│   └── Models/
└── Dockerfile
```

### 3.4 API Design

GET /api/users/me: Returns the current user's complete profile including addresses and preferences. This is the primary endpoint used by the customer frontend.

PUT /api/users/me: Updates the user's profile. Supports partial updates for individual fields. Fields include firstName, lastName, phone, and dateOfBirth. Returns the updated profile.

GET /api/users/me/addresses: Returns all addresses for the current user with default shipping and billing flags.

POST /api/users/me/addresses: Adds a new address. Body includes street, city, state, postalCode, country, isDefaultShipping, and isDefaultBilling. Returns the created address with ID.

PUT /api/users/me/addresses/{id}: Updates an existing address.

DELETE /api/users/me/addresses/{id}: Deletes an address. Cannot delete the default shipping or billing address without setting a new default first.

GET /api/users/me/preferences: Returns notification preferences including emailOptIn, smsOptIn, and marketingOptIn.

PUT /api/users/me/preferences: Updates notification preferences.

DELETE /api/users/me: Initiates account deletion per GDPR right to erasure. This is a soft delete that marks the account for deletion after a 30 day grace period. During the grace period, the user can cancel the deletion. After 30 days, a background job anonymizes all personal data.

### 3.5 Database Design

UserProfiles table: Id (GUID), AuthServiceUserId (GUID referencing Auth Service), FirstName, LastName, Phone, DateOfBirth, CreatedAt, UpdatedAt, DeletedAt (soft delete), AnonymizedAt. Addresses table: Id, UserProfileId, Street, City, State, PostalCode, Country, IsDefaultShipping, IsDefaultBilling, CreatedAt. NotificationPreferences table: Id, UserProfileId, EmailOptIn, SmsOptIn, MarketingOptIn, OrderUpdatesOptIn, CreatedAt, UpdatedAt.

### 3.6 Message Flow

When a profile is updated, the service saves changes to the database and publishes a ProfileUpdatedEvent through the outbox pattern. The Analytics Service consumes this to update customer segments. When an address is added, an AddressAddedEvent is published. The Order Service consumes this to prefill shipping addresses during checkout. When an account deletion is requested, an AccountDeletedEvent is published. All services consume this to anonymize or delete user associated data.

### 3.7 Dependencies and Communication

The User Service depends on Azure SQL Database for persistence, Redis for profile caching, and Azure Service Bus for event publishing. It does not call other services directly. Other services call it to look up user profiles.

### 3.8 Scaling Strategy

The User Service runs 2 replicas minimum. Profile reads are served from Redis cache with a 5 minute TTL. Writes always go to the database and invalidate the cache. Scaling triggers at 70% CPU.

### 3.9 Security

Users can only access their own profile. The controller extracts the user ID from the JWT token and uses it as a filter on all queries. There is no endpoint to query another user's profile. Address data is encrypted at rest using Azure SQL transparent data encryption. GDPR deletion runs as a background job that anonymizes rather than deletes records to preserve referential integrity with orders.

### 3.10 Failure Scenarios

If the database is unavailable, cached profiles can still be read. Writes fail with a 503 status. If Redis is unavailable, all requests go to the database, which may cause performance degradation but not functional failure.

### 3.11 Deployment

Kubernetes Deployment with 2 replicas. Rolling update strategy. Database migrations run as init containers.

### 3.12 Observability

Metrics include profile update rate, address creation rate, and deletion request rate. Alerts trigger on error rate above 5%.

### 3.13 Testing

Unit tests cover validation logic and domain rules. Integration tests verify database operations. Contract tests verify API responses.

### 3.14 Versioning

API version 1.0.0. Future versions may add profile picture upload and social profile linking.

### 3.15 Future Improvements

Profile picture upload to Blob Storage, address validation using third party APIs, loyalty program integration, and preference prediction based on purchase history.

---

## 4. Product Service

### 4.1 Purpose and Responsibilities

The Product Service is the heart of the e commerce catalog. It manages the entire product information hierarchy from categories down to individual product variants. This service is read heavy and performance critical because nearly every customer interaction begins with product browsing or search.

Responsibilities include category management with hierarchical navigation, product CRUD with rich content support, variant management for size/color combinations, product image management, review and rating management, search index integration with Azure AI Search, and pricing calculation with promotion support.

### 4.2 Internal Architecture

The Product Service uses Clean Architecture with CQRS (Command Query Responsibility Segregation) for read/write separation. Commands that modify data go through the full domain model validation and event publishing pipeline. Queries that read data can bypass the domain model and use optimized SQL projections or cached results directly.

### 4.3 Folder Structure

```
src/CloudMart.ProductService/
├── CloudMart.ProductService.csproj
├── Program.cs
├── appsettings.json
├── Domain/
│   ├── Entities/
│   │   ├── Category.cs
│   │   ├── Product.cs
│   │   ├── ProductVariant.cs
│   │   ├── ProductImage.cs
│   │   └── ProductReview.cs
│   ├── ValueObjects/
│   │   ├── Money.cs
│   │   ├── SKU.cs
│   │   └── Slug.cs
│   ├── Specifications/
│   │   ├── InStockSpecification.cs
│   │   └── ActiveProductSpecification.cs
│   └── Events/
│       ├── ProductCreatedEvent.cs
│       ├── ProductUpdatedEvent.cs
│       ├── PriceChangedEvent.cs
│       └── StockStatusChangedEvent.cs
├── Application/
│   ├── Commands/
│   │   ├── CreateProductCommand.cs
│   │   ├── UpdateProductCommand.cs
│   │   ├── CreateCategoryCommand.cs
│   │   └── AddReviewCommand.cs
│   ├── Queries/
│   │   ├── GetProductQuery.cs
│   │   ├── SearchProductsQuery.cs
│   │   ├── GetCategoryTreeQuery.cs
│   │   └── GetFeaturedProductsQuery.cs
│   ├── Handlers/
│   ├── DTOs/
│   └── Validators/
├── Infrastructure/
│   ├── Persistence/
│   │   ├── ProductDbContext.cs
│   │   └── Migrations/
│   ├── Search/
│   │   ├── SearchIndexClient.cs
│   │   └── SearchQueryBuilder.cs
│   ├── Storage/
│   │   └── BlobImageService.cs
│   └── Repositories/
│       ├── ProductRepository.cs
│       └── CachedProductRepository.cs
├── API/
│   ├── Controllers/
│   │   ├── ProductsController.cs
│   │   ├── CategoriesController.cs
│   │   └── ReviewsController.cs
│   └── Models/
└── Dockerfile
```

### 4.4 API Design

GET /api/products: Search and filter products. Query parameters include search (full text), categoryId, minPrice, maxPrice, rating, sort (relevance, price, rating, newest), page, and pageSize. Returns paginated results with product summaries.

GET /api/products/{id}: Get detailed product information including variants, images, and reviews.

GET /api/products/{id}/reviews: Get reviews for a product with pagination and sort options.

POST /api/products/{id}/reviews: Submit a review. Body includes rating (1-5), title, and body. Requires authentication and verified purchase.

GET /api/products/featured: Get featured products for homepage display.

GET /api/categories: Get the category tree as a nested structure.

GET /api/categories/{id}/products: Get products in a category with inheritance from child categories.

POST /api/products: Admin only. Create a new product with variants and images.

PUT /api/products/{id}: Admin only. Update product information.

DELETE /api/products/{id}: Admin only. Soft delete a product.

### 4.5 Database Design

Categories table: Id, Name, Slug, ParentId (self referencing), Description, ImageUrl, SortOrder, IsActive. Products table: Id, Name, Slug, Description, ShortDescription, CategoryId, BasePrice, CompareAtPrice, IsActive, CreatedAt, UpdatedAt. ProductVariants table: Id, ProductId, SKU, VariantName (e.g. "Large / Red"), PriceAdjustment, Weight, IsActive. ProductImages table: Id, ProductId, VariantId (nullable), ImageUrl, AltText, SortOrder, IsPrimary. ProductReviews table: Id, ProductId, UserId, Rating, Title, Body, IsVerifiedPurchase, HelpfulCount, CreatedAt.

### 4.6 Message Flow

When a product is created or updated, the service saves changes to SQL Database and publishes a ProductUpdatedEvent. A background service also updates the Azure AI Search index asynchronously. When a review is submitted, a ReviewAddedEvent is published. The Analytics Service consumes this to update product rating aggregates. When price changes, a PriceChangedEvent is published. The Cart Service consumes this to update prices in active carts.

### 4.7 Dependencies and Communication

The Product Service depends on Azure SQL Database, Azure AI Search, Azure Blob Storage for images, Redis for caching, and Azure Service Bus for events. It does not call other services synchronously.

### 4.8 Scaling Strategy

The Product Service runs 3 replicas minimum due to high read volume. Product listings are cached in Redis with a 10 minute TTL. Search queries go directly to Azure AI Search, bypassing the database. Scaling triggers at 70% CPU or 500 requests per second per pod.

### 4.9 Security

Product reads are public and require no authentication. Write operations require admin role verified through JWT claims. Image uploads validate file types and scan for malware. Reviews are moderated: new reviews enter a pending state and become visible after admin approval or after passing automated content filtering.

### 4.10 Failure Scenarios

If Azure AI Search is unavailable, product search falls back to database queries with degraded performance. If Blob Storage is unavailable, product pages display without images. If Redis is unavailable, all reads go to the database. The service degrades gracefully rather than failing completely.

### 4.11 Deployment

Kubernetes Deployment with 3 replicas. The search index update runs as a background service within the pod rather than a separate job.

### 4.12 Observability

Metrics include search query rate, search latency, cache hit rate, product view rate, and review submission rate. Alerts trigger on search latency above 500ms or cache hit rate below 80%.

### 4.13 Testing

Unit tests cover pricing calculations, search query building, and review validation. Integration tests verify database queries and search index updates. Load tests simulate 1000 concurrent product searches.

### 4.14 Versioning

API version 1.0.0. Future versions may add faceted search improvements and recommendation endpoints.

### 4.15 Future Improvements

Personalized product recommendations, advanced faceted search with aggregations, product comparison feature, and bulk import/export for administrators.

---

## 5. Cart Service

### 5.1 Purpose and Responsibilities

The Cart Service manages shopping carts and wishlists. It is a high traffic service because every customer interaction with products potentially involves cart operations. The service must be fast and available because cart abandonment directly impacts revenue.

Responsibilities include cart item CRUD operations, quantity validation against inventory, price calculation with live pricing from the Product Service, promotion code application, cart expiration and cleanup, guest cart merging upon login, and wishlist management.

### 5.2 Internal Architecture

The Cart Service uses a hybrid persistence model. Active carts are stored in Redis for sub millisecond read and write access. Carts are periodically snapshotted to Azure SQL Database for durability and for long term storage of abandoned cart data. This hybrid approach gives us the speed of Redis with the durability of SQL.

### 5.3 Folder Structure

```
src/CloudMart.CartService/
├── CloudMart.CartService.csproj
├── Program.cs
├── appsettings.json
├── Domain/
│   ├── Entities/
│   │   ├── Cart.cs
│   │   ├── CartItem.cs
│   │   └── WishlistItem.cs
│   ├── ValueObjects/
│   │   ├── CartId.cs
│   │   └── Quantity.cs
│   └── Events/
│       ├── CartCreatedEvent.cs
│       ├── ItemAddedToCartEvent.cs
│       └── CartAbandonedEvent.cs
├── Application/
│   ├── Commands/
│   │   ├── CreateCartCommand.cs
│   │   ├── AddItemCommand.cs
│   │   ├── UpdateQuantityCommand.cs
│   │   ├── RemoveItemCommand.cs
│   │   ├── ApplyPromotionCommand.cs
│   │   └── MergeGuestCartCommand.cs
│   ├── Queries/
│   │   ├── GetCartQuery.cs
│   │   └── GetCartSummaryQuery.cs
│   ├── Handlers/
│   ├── DTOs/
│   └── Validators/
├── Infrastructure/
│   ├── Persistence/
│   │   ├── CartDbContext.cs
│   │   └── Migrations/
│   ├── Cache/
│   │   ├── RedisCartStore.cs
│   │   └── CartKeyBuilder.cs
│   └── Repositories/
│       └── CartRepository.cs
├── API/
│   ├── Controllers/
│   │   └── CartsController.cs
│   └── Models/
└── Dockerfile
```

### 5.4 API Design

GET /api/cart: Get the current user's cart. Returns items with product details, quantities, unit prices, line totals, subtotal, tax estimate, shipping estimate, discount total, and grand total.

POST /api/cart/items: Add an item to the cart. Body includes productId, variantId, and quantity. Validates that the product exists, the variant exists, and the quantity is available in inventory. Returns the updated cart.

PUT /api/cart/items/{id}: Update item quantity. Validates inventory availability. If quantity is set to 0, the item is removed.

DELETE /api/cart/items/{id}: Remove an item from the cart.

POST /api/cart/promotion: Apply a promotion code. Validates the code, checks expiration, verifies usage limits, and recalculates cart totals. Returns the discount amount and updated totals.

DELETE /api/cart/promotion: Remove the applied promotion code.

POST /api/cart/merge: Merge a guest cart into the authenticated user's cart. Called after login. Items are combined, with quantities summed for matching product/variant combinations.

GET /api/wishlist: Get the user's wishlist.

POST /api/wishlist/items: Add an item to the wishlist.

POST /api/wishlist/items/{id}/move-to-cart: Move a wishlist item to the cart.

### 5.5 Database Design

Carts table: Id, UserId (nullable for guest carts), SessionId (for guest carts), Status (Active, Converted, Abandoned), PromotionCode, PromotionDiscount, CreatedAt, UpdatedAt, ExpiresAt. CartItems table: Id, CartId, ProductId, VariantId, Quantity, UnitPrice, LineTotal, AddedAt. WishlistItems table: Id, UserId, ProductId, VariantId, AddedAt. The Redis storage uses hash structures: cart:{cartId} stores cart metadata, cart:{cartId}:items stores cart items as a hash, and cart:{cartId}:ttl stores expiration.

### 5.6 Message Flow

When an item is added to the cart, the service validates inventory by calling the Inventory Service. If inventory is insufficient, the request fails with a 422 status. When a cart is abandoned (no activity for 24 hours), a CartAbandonedEvent is published. The Notification Service consumes this to send abandoned cart emails. When a cart is converted to an order, the cart status changes to Converted and the cart data is archived.

### 5.7 Dependencies and Communication

The Cart Service depends on Redis for primary storage, Azure SQL Database for snapshots and archival, the Inventory Service for stock validation via HTTP, the Product Service for current pricing via HTTP, and Azure Service Bus for events.

### 5.8 Scaling Strategy

The Cart Service runs 3 replicas minimum. Redis handles most read traffic. Scaling triggers at 70% CPU. The service is stateless with all state in Redis and SQL.

### 5.9 Security

Users can only access their own carts. The service extracts the user ID from the JWT token. Guest carts are identified by a session ID stored in a secure, HTTP only cookie. Cart IDs are UUIDs that are unguessable, preventing cart enumeration attacks.

### 5.10 Failure Scenarios

If Redis is unavailable, the service falls back to SQL Database with degraded performance. If the Inventory Service is unavailable, cart additions are allowed with a warning that availability will be confirmed at checkout. If the Product Service is unavailable, cart displays use the last known price and show a disclaimer.

### 5.11 Deployment

Kubernetes Deployment with 3 replicas. Rolling update strategy.

### 5.12 Observability

Metrics include cart creation rate, item addition rate, abandonment rate, conversion rate, and average cart value. Alerts trigger on cart service error rate above 2%.

### 5.13 Testing

Unit tests cover price calculations, promotion application, and cart merging. Integration tests verify Redis operations and inventory service calls. Load tests simulate 500 concurrent cart operations.

### 5.14 Versioning

API version 1.0.0.

### 5.15 Future Improvements

Save for later feature, cart sharing via link, persistent carts across devices without login, and intelligent product recommendations based on cart contents.

---

## 6. Order Service

### 6.1 Purpose and Responsibilities

The Order Service is the transactional core of the platform. It manages the entire order lifecycle from creation through fulfillment. This service implements the saga pattern for distributed transactions because an order creation involves coordination across Cart, Inventory, Payment, and Notification services.

Responsibilities include order creation and validation, order state machine management, saga orchestration for distributed transactions, order history and lookup, cancellation and refund coordination, shipping tracking integration, and order analytics data generation.

### 6.2 Internal Architecture

The Order Service uses Clean Architecture with CQRS and event sourcing for the order aggregate. The order state is stored as a sequence of events in an event store rather than a single row in a table. This provides an immutable audit trail of every state change and enables temporal queries like "what was the order status at this point in time."

For performance, the service also maintains a read model projection that is updated asynchronously from the event stream. Queries use the read model for fast responses. Commands append events to the event store.

### 6.3 Folder Structure

```
src/CloudMart.OrderService/
├── CloudMart.OrderService.csproj
├── Program.cs
├── appsettings.json
├── Domain/
│   ├── Aggregates/
│   │   └── OrderAggregate.cs
│   ├── Entities/
│   │   ├── Order.cs
│   │   ├── OrderItem.cs
│   │   └── OrderStatusHistory.cs
│   ├── ValueObjects/
│   │   ├── OrderNumber.cs
│   │   ├── Money.cs
│   │   └── ShippingAddress.cs
│   ├── Events/
│   │   ├── OrderCreatedEvent.cs
│   │   ├── OrderConfirmedEvent.cs
│   │   ├── OrderShippedEvent.cs
│   │   ├── OrderDeliveredEvent.cs
│   │   ├── OrderCancelledEvent.cs
│   │   └── OrderRefundedEvent.cs
│   └── Services/
│       └── OrderSagaOrchestrator.cs
├── Application/
│   ├── Commands/
│   │   ├── CreateOrderCommand.cs
│   │   ├── ConfirmOrderCommand.cs
│   │   ├── CancelOrderCommand.cs
│   │   └── UpdateShippingStatusCommand.cs
│   ├── Queries/
│   │   ├── GetOrderQuery.cs
│   │   ├── GetOrderHistoryQuery.cs
│   │   └── GetOrdersByUserQuery.cs
│   ├── Handlers/
│   ├── Saga/
│   │   ├── OrderSaga.cs
│   │   ├── ReserveInventoryStep.cs
│   │   ├── ProcessPaymentStep.cs
│   │   └── CompensatingActions.cs
│   ├── DTOs/
│   └── Projections/
│       └── OrderReadModelProjector.cs
├── Infrastructure/
│   ├── Persistence/
│   │   ├── OrderDbContext.cs
│   │   ├── EventStore.cs
│   │   └── Migrations/
│   ├── Repositories/
│   │   ├── OrderRepository.cs
│   │   └── EventStoreRepository.cs
│   └── Sagas/
│       └── SagaStateMachine.cs
├── API/
│   ├── Controllers/
│   │   └── OrdersController.cs
│   └── Models/
└── Dockerfile
```

### 6.4 API Design

POST /api/orders: Create a new order from the current cart. The service initiates the order saga: validates the cart, reserves inventory, processes payment, and confirms the order. Returns 201 Created with the order confirmation.

GET /api/orders: Get the current user's order history with pagination.

GET /api/orders/{id}: Get detailed order information including items, status history, shipping tracking, and payment details.

POST /api/orders/{id}/cancel: Cancel an order. Only allowed if the order status is CONFIRMED or PROCESSING. Initiates cancellation saga: release inventory, process refund if payment was captured.

GET /api/orders/{id}/tracking: Get shipping tracking information.

POST /api/admin/orders/{id}/ship: Admin only. Mark order as shipped with tracking information.

POST /api/admin/orders/{id}/deliver: Admin only. Mark order as delivered.

### 6.5 Database Design

Orders table: Id, OrderNumber (human readable, unique), UserId, Status, Subtotal, Tax, Shipping, Discount, Total, ShippingAddress (JSON), PaymentIntentId, CreatedAt, UpdatedAt. OrderItems table: Id, OrderId, ProductId, VariantId, ProductName, SKU, Quantity, UnitPrice, TotalPrice. OrderStatusHistory table: Id, OrderId, Status, ChangedAt, ChangedBy, Reason. EventStore table: Id, AggregateId, AggregateType, EventType, EventData (JSON), SequenceNumber, OccurredAt. OrderReadModel table: Id, OrderId, UserId, Status, Total, ItemCount, CreatedAt, LastUpdated (materialized view for fast queries).

### 6.6 Message Flow

The order saga coordinates distributed transactions through events: OrderCreatedEvent triggers inventory reservation, InventoryReservedEvent triggers payment processing, PaymentProcessedEvent triggers order confirmation, OrderConfirmedEvent triggers cart clearing and notification sending. If any step fails, compensating events undo previous steps: PaymentFailedEvent triggers inventory release and order cancellation.

### 6.7 Dependencies and Communication

The Order Service depends on Azure SQL Database for event store and read model, the Cart Service for cart retrieval via HTTP, the Inventory Service for reservation via HTTP, the Payment Service for payment processing via HTTP, and Azure Service Bus for saga event coordination.

### 6.8 Scaling Strategy

The Order Service runs 2 replicas minimum. Order creation is less frequent than product browsing but requires high reliability. Scaling triggers at 70% CPU.

### 6.9 Security

Users can only view and cancel their own orders. Admin endpoints require admin role. Order numbers are sequential but use a format that prevents enumeration. Event sourcing provides an immutable audit trail for compliance.

### 6.10 Failure Scenarios

If inventory reservation fails, the order is not created and the customer sees an out of stock message. If payment fails after inventory is reserved, the saga compensates by releasing the reservation. If the Payment Service is unavailable during order creation, the order enters a PAYMENT_PENDING state and retry logic attempts payment periodically.

### 6.11 Deployment

Kubernetes Deployment with 2 replicas. The saga state machine runs within the application process. For higher reliability, a separate saga orchestrator could be extracted in the future.

### 6.12 Observability

Metrics include order creation rate, order confirmation rate, cancellation rate, saga completion time, and payment failure rate. Alerts trigger on order creation error rate above 2% or saga completion time above 30 seconds.

### 6.13 Testing

Unit tests cover saga state transitions, compensating actions, and order number generation. Integration tests verify the full saga flow with test doubles for external services. End to end tests create real orders through the API.

### 6.14 Versioning

API version 1.0.0.

### 6.15 Future Improvements

Partial fulfillment for split shipments, order editing before processing, batch order operations for B2B customers, and estimated delivery date calculation based on shipping rules.

---

## 7. Payment Service

### 7.1 Purpose and Responsibilities

The Payment Service handles all financial transactions for the platform. It integrates with Stripe for payment processing while maintaining its own records for reconciliation and reporting. This service is critical because it handles money and must be correct, secure, and auditable.

Responsibilities include payment processing through Stripe, refund processing, payment method management, webhook handling from Stripe, idempotency enforcement to prevent duplicate charges, reconciliation between internal records and Stripe, and financial reporting data generation.

### 7.2 Internal Architecture

The Payment Service uses Clean Architecture with emphasis on auditability and idempotency. Every payment operation is recorded before execution to ensure we can always determine what happened. Idempotency keys prevent duplicate operations when clients retry failed requests.

### 7.3 Folder Structure

```
src/CloudMart.PaymentService/
├── CloudMart.PaymentService.csproj
├── Program.cs
├── appsettings.json
├── Domain/
│   ├── Entities/
│   │   ├── Payment.cs
│   │   ├── Refund.cs
│   │   └── PaymentMethod.cs
│   ├── ValueObjects/
│   │   ├── TransactionId.cs
│   │   └── Money.cs
│   └── Events/
│       ├── PaymentProcessedEvent.cs
│       ├── PaymentFailedEvent.cs
│       └── RefundProcessedEvent.cs
├── Application/
│   ├── Commands/
│   │   ├── ProcessPaymentCommand.cs
│   │   ├── ProcessRefundCommand.cs
│   │   └── SavePaymentMethodCommand.cs
│   ├── Queries/
│   │   ├── GetPaymentQuery.cs
│   │   └── GetPaymentMethodsQuery.cs
│   ├── Handlers/
│   ├── DTOs/
│   └── Idempotency/
│       └── IdempotencyChecker.cs
├── Infrastructure/
│   ├── Persistence/
│   │   ├── PaymentDbContext.cs
│   │   └── Migrations/
│   ├── PaymentGateway/
│   │   ├── StripeClient.cs
│   │   ├── StripeWebhookHandler.cs
│   │   └── StripeEventMapper.cs
│   └── Repositories/
│       └── PaymentRepository.cs
├── API/
│   ├── Controllers/
│   │   ├── PaymentsController.cs
│   │   └── WebhooksController.cs
│   └── Models/
└── Dockerfile
```

### 7.4 API Design

POST /api/payments: Process a payment. Body includes orderId, amount, currency, paymentMethodId (Stripe token), and idempotencyKey. Returns the payment status and transaction ID. This endpoint is called by the Order Service during saga execution.

POST /api/payments/refunds: Process a refund. Body includes paymentId, amount (partial or full), and reason. Returns the refund status. Admin only for partial refunds. Full refunds can be triggered by the Order Service during cancellation.

GET /api/payments/{id}: Get payment details.

GET /api/payment-methods: Get saved payment methods for the current user.

POST /api/payment-methods: Save a new payment method using Stripe Setup Intents.

POST /webhooks/stripe: Receive Stripe webhook events. Validates the Stripe signature, processes the event, and updates internal records.

### 7.5 Database Design

Payments table: Id, OrderId, StripePaymentIntentId, Amount, Currency, Status, PaymentMethodType, FailureReason, IdempotencyKey, CreatedAt, UpdatedAt. Refunds table: Id, PaymentId, StripeRefundId, Amount, Reason, Status, CreatedAt. PaymentMethods table: Id, UserId, StripePaymentMethodId, Type, LastFourDigits, ExpiryMonth, ExpiryYear, IsDefault, CreatedAt.

### 7.6 Message Flow

When a payment is processed, the service records the payment record with PENDING status, calls Stripe with the idempotency key, updates the record with Stripe's response, and publishes a PaymentProcessedEvent or PaymentFailedEvent. When a Stripe webhook arrives, the service validates the signature, maps the event to a domain event, updates the payment record, and publishes the corresponding event.

### 7.7 Dependencies and Communication

The Payment Service depends on Azure SQL Database, Stripe API, and Azure Service Bus for events. It does not call other services synchronously. Other services call it to process payments.

### 7.8 Scaling Strategy

The Payment Service runs 2 replicas minimum. Payment processing is relatively low volume but must be reliable. Scaling triggers at 70% CPU.

### 7.9 Security

Card data never touches our servers. Stripe Elements captures card details on the client side and returns a payment method token. Our server only handles tokens, never card numbers. Webhook signatures are verified to ensure events come from Stripe. Idempotency keys are stored with a TTL to prevent replay attacks. All payment records are encrypted at rest using Azure SQL TDE.

### 7.10 Failure Scenarios

If Stripe API is unavailable, payments fail and the saga compensates. If webhook delivery fails, Stripe retries automatically with exponential backoff. If the database is unavailable during payment processing, in flight payments may be in an indeterminate state. A reconciliation job runs hourly to detect and resolve discrepancies.

### 7.11 Deployment

Kubernetes Deployment with 2 replicas. Webhook endpoints must be publicly accessible for Stripe to deliver events.

### 7.12 Observability

Metrics include payment success rate, payment latency, refund rate, and webhook processing rate. Alerts trigger on payment failure rate above 5% or webhook processing backlog above 100 events.

### 7.13 Testing

Unit tests cover idempotency logic, webhook signature verification, and money calculations. Integration tests use Stripe's test environment with test card numbers. Contract tests verify API responses.

### 7.14 Versioning

API version 1.0.0.

### 7.15 Future Improvements

Subscription billing support, multi currency pricing with dynamic conversion, split payments across multiple cards, and automated reconciliation reporting.

---

## 8. Inventory Service

### 8.1 Purpose and Responsibilities

The Inventory Service manages stock levels and reservations. It prevents overselling by coordinating stock allocation across concurrent orders. This service requires careful handling of concurrency because multiple orders may attempt to reserve the same stock simultaneously.

Responsibilities include stock level tracking at SKU level, reservation creation and management, stock commitment upon order confirmation, reservation release upon cancellation or timeout, stock adjustment for receipts and damage, low stock alerting, and inventory movement history.

### 8.2 Internal Architecture

The Inventory Service uses an optimistic locking strategy for concurrency control. When reserving stock, the service reads the current level, calculates the new level, and updates only if the level has not changed since reading. If a concurrent update occurred, the operation retries. This avoids database locks that could cause deadlocks under high load.

### 8.3 Folder Structure

```
src/CloudMart.InventoryService/
├── CloudMart.InventoryService.csproj
├── Program.cs
├── appsettings.json
├── Domain/
│   ├── Entities/
│   │   ├── InventoryItem.cs
│   │   ├── Reservation.cs
│   │   └── StockMovement.cs
│   ├── ValueObjects/
│   │   ├── SKU.cs
│   │   └── Quantity.cs
│   └── Events/
│       ├── StockReservedEvent.cs
│       ├── StockReleasedEvent.cs
│       ├── StockCommittedEvent.cs
│       └── LowStockAlertEvent.cs
├── Application/
│   ├── Commands/
│   │   ├── ReserveStockCommand.cs
│   │   ├── CommitStockCommand.cs
│   │   ├── ReleaseStockCommand.cs
│   │   └── AdjustStockCommand.cs
│   ├── Queries/
│   │   ├── GetStockLevelQuery.cs
│   │   └── CheckAvailabilityQuery.cs
│   ├── Handlers/
│   └── DTOs/
├── Infrastructure/
│   ├── Persistence/
│   │   ├── InventoryDbContext.cs
│   │   └── Migrations/
│   ├── Cache/
│   │   └── StockCache.cs
│   └── Repositories/
│       └── InventoryRepository.cs
├── API/
│   ├── Controllers/
│   │   └── InventoryController.cs
│   └── Models/
├── Jobs/
│   ├── ReservationExpiryJob.cs
│   └── LowStockAlertJob.cs
└── Dockerfile
```

### 8.4 API Design

POST /api/inventory/reserve: Reserve stock for an order. Body includes orderId and items array with SKU and quantity. Uses optimistic locking to prevent overselling. Returns reservation confirmation with expiry timestamp.

POST /api/inventory/commit: Commit reserved stock to actual deduction. Called when an order is confirmed. Converts reservations to stock deductions.

POST /api/inventory/release: Release a reservation. Called when an order is cancelled or payment fails. Restores stock to available pool.

GET /api/inventory/{sku}: Get current stock level and availability.

POST /api/admin/inventory/adjust: Admin only. Adjust stock level for receipts, damage, or corrections. Body includes SKU, adjustment amount, and reason.

GET /api/admin/inventory/low-stock: Admin only. Get items below their reorder threshold.

### 8.5 Database Design

InventoryItems table: Id, SKU, ProductId, VariantId, TotalStock, ReservedStock, AvailableStock (computed as TotalStock - ReservedStock), ReorderThreshold, ReorderQuantity, LastUpdated, RowVersion (timestamp for optimistic locking). Reservations table: Id, OrderId, SKU, Quantity, Status (Active, Committed, Released, Expired), CreatedAt, ExpiresAt, CommittedAt. StockMovements table: Id, SKU, MovementType (Receipt, Sale, Adjustment, Return, ReservationExpiry), Quantity, PreviousStock, NewStock, Reason, CreatedAt.

### 8.6 Message Flow

When stock is reserved, a StockReservedEvent is published. When committed, a StockCommittedEvent is published. When released, a StockReleasedEvent is published. When available stock drops below the reorder threshold, a LowStockAlertEvent is published. The Product Service consumes stock events to update product availability status. The Analytics Service consumes them for inventory reporting.

### 8.7 Dependencies and Communication

The Inventory Service depends on Azure SQL Database, Redis for stock level caching, and Azure Service Bus for events. It is called by the Order Service and Product Service.

### 8.8 Scaling Strategy

The Inventory Service runs 2 replicas minimum. Stock operations are relatively quick database transactions. Scaling triggers at 70% CPU. The RowVersion column enables optimistic locking across all replicas.

### 8.9 Security

Stock reads are internal only. Adjustments require admin role. All adjustments are logged in StockMovements for audit. Reservation endpoints are internal and accessible only from other services within the cluster.

### 8.10 Failure Scenarios

If optimistic locking fails repeatedly (more than 3 retries), the request returns a 409 Conflict with a retry recommendation. If the database is unavailable, stock checks fail and the Order Service treats this as insufficient stock, preventing overselling. Expired reservations are cleaned up by a background job running every 5 minutes.

### 8.11 Deployment

Kubernetes Deployment with 2 replicas. Background jobs run as hosted services within the pods.

### 8.12 Observability

Metrics include reservation rate, commitment rate, release rate, stock adjustment rate, low stock alert rate, and optimistic lock conflict rate. Alerts trigger on conflict rate above 10% indicating excessive contention.

### 8.13 Testing

Unit tests cover stock calculations and optimistic locking logic. Integration tests verify concurrent reservation handling using parallel tasks. Load tests simulate 100 concurrent reservations on the same SKU.

### 8.14 Versioning

API version 1.0.0.

### 8.15 Future Improvements

Distributed inventory across multiple warehouses, FIFO/LIFO stock allocation strategies, automated reorder point calculation, and demand forecasting integration.

---

## 9. Notification Service

### 9.1 Purpose and Responsibilities

The Notification Service handles all customer communications. It consumes domain events from other services and delivers notifications through multiple channels. This service is decoupled from business logic: services publish events without knowing how or if notifications will be sent.

Responsibilities include email delivery via SendGrid, SMS delivery via Twilio, push notification delivery via Azure Notification Hubs, template management with variable substitution, delivery tracking and bounce handling, user preference enforcement, rate limiting to prevent spam, and retry logic for failed deliveries.

### 9.2 Internal Architecture

The Notification Service is event driven. It consumes messages from Azure Service Bus and processes them asynchronously. The service is structured around channel specific handlers that share a common interface. New channels can be added without modifying existing code.

### 9.3 Folder Structure

```
src/CloudMart.NotificationService/
├── CloudMart.NotificationService.csproj
├── Program.cs
├── appsettings.json
├── Domain/
│   ├── Entities/
│   │   ├── Notification.cs
│   │   ├── NotificationTemplate.cs
│   │   └── DeliveryAttempt.cs
│   ├── ValueObjects/
│   │   ├── EmailAddress.cs
│   │   └── PhoneNumber.cs
│   └── Events/
│       └── NotificationSentEvent.cs
├── Application/
│   ├── Handlers/
│   │   ├── OrderEventHandler.cs
│   │   ├── UserEventHandler.cs
│   │   └── PaymentEventHandler.cs
│   ├── Channels/
│   │   ├── IChannel.cs
│   │   ├── EmailChannel.cs
│   │   ├── SmsChannel.cs
│   │   └── PushChannel.cs
│   ├── Templating/
│   │   ├── ITemplateEngine.cs
│   │   └── ScribanTemplateEngine.cs
│   └── DTOs/
├── Infrastructure/
│   ├── Persistence/
│   │   ├── NotificationDbContext.cs
│   │   └── Migrations/
│   ├── Messaging/
│   │   └── ServiceBusConsumer.cs
│   ├── SendGrid/
│   │   ├── SendGridClient.cs
│   │   └── SendGridWebhookHandler.cs
│   └── Twilio/
│       ├── TwilioClient.cs
│       └── TwilioWebhookHandler.cs
├── API/
│   ├── Controllers/
│   │   └── WebhooksController.cs
│   └── Models/
└── Dockerfile
```

### 9.4 API Design

The Notification Service primarily consumes events rather than exposing a public API. It exposes webhook endpoints for delivery status updates: POST /webhooks/sendgrid receives SendGrid delivery events, POST /webhooks/twilio receives Twilio delivery status, and POST /webhooks/push receives push notification feedback.

Internal endpoints include GET /api/notifications/{userId}/history for retrieving notification history and PUT /api/notifications/preferences for updating channel preferences.

### 9.5 Database Design

Notifications table: Id, UserId, Type, Channel, Subject, Body, Status, SentAt, DeliveredAt, OpenedAt, ClickedAt, ErrorMessage. NotificationTemplates table: Id, Name, SubjectTemplate, BodyTemplate, Channel, Variables (JSON schema), CreatedAt, UpdatedAt. DeliveryAttempts table: Id, NotificationId, AttemptNumber, Status, ErrorMessage, AttemptedAt.

### 9.6 Message Flow

The service registers message handlers for specific event types: OrderCreatedEvent triggers order confirmation email, OrderShippedEvent triggers shipping notification with tracking, OrderDeliveredEvent triggers delivery confirmation and review request, UserRegisteredEvent triggers welcome email, PaymentProcessedEvent triggers payment receipt, PaymentFailedEvent triggers payment failure notification with retry instructions.

For each event: the handler loads the appropriate template, enriches event data with user details from the User Service, renders the template with variables, checks user preferences to determine channels, sends through selected channels, records the notification in the database, and tracks delivery status through webhooks.

### 9.7 Dependencies and Communication

The Notification Service depends on Azure SQL Database for notification history, Azure Service Bus for event consumption, SendGrid for email, Twilio for SMS, Azure Notification Hubs for push, and the User Service for user details. It calls the User Service to look up email addresses and phone numbers.

### 9.8 Scaling Strategy

The Notification Service runs 2 replicas minimum. Event processing is horizontally scalable: multiple replicas can consume from the same subscription with Service Bus handling load balancing. Scaling triggers at 70% CPU or message backlog above 1000 messages.

### 9.9 Security

Webhook endpoints validate signatures from SendGrid and Twilio to ensure events are authentic. Email templates are sanitized to prevent XSS in email clients. User preferences are enforced before any delivery: if a user opts out of marketing emails, marketing events are silently dropped.

### 9.10 Failure Scenarios

If SendGrid is unavailable, emails are queued for retry with exponential backoff. After maximum retries, the notification status is set to Failed and an alert is sent to operations. If the User Service is unavailable when enriching notifications, the event is deferred and retried later. Template rendering failures are caught and logged without crashing the consumer.

### 9.11 Deployment

Kubernetes Deployment with 2 replicas. Service Bus consumers start automatically when the application starts.

### 9.12 Observability

Metrics include notification send rate, delivery rate, open rate, click rate, bounce rate, and failure rate per channel. Alerts trigger on delivery failure rate above 5% or message processing lag above 5 minutes.

### 9.13 Testing

Unit tests cover template rendering and channel selection logic. Integration tests verify SendGrid and Twilio API calls using sandbox credentials. Event consumption tests publish test events and verify notification creation.

### 9.14 Versioning

Internal API version 1.0.0.

### 9.15 Future Improvements

Notification preference center UI, A/B testing for email templates, scheduled notification campaigns, and multi language template support.

---

## 10. Analytics Service

### 10.1 Purpose and Responsibilities

The Analytics Service aggregates data from across the platform for reporting and business intelligence. It consumes domain events and builds optimized data structures for querying. This service is separate from transactional services to prevent analytical queries from impacting system performance.

Responsibilities include event consumption and persistence, data aggregation and rollup calculation, dashboard data API, report generation and export, funnel analysis, cohort analysis, and real time metrics calculation.

### 10.2 Internal Architecture

The Analytics Service uses an event sourced approach where all raw events are stored in Azure Data Lake. Scheduled jobs aggregate these events into summary tables in Azure Synapse Analytics. The API layer queries these summary tables for fast responses.

### 10.3 Folder Structure

```
src/CloudMart.AnalyticsService/
├── CloudMart.AnalyticsService.csproj
├── Program.cs
├── appsettings.json
├── Domain/
│   ├── Entities/
│   │   ├── AnalyticsEvent.cs
│   │   └── AggregationWindow.cs
│   └── Events/
│       └── AggregationCompletedEvent.cs
├── Application/
│   ├── Handlers/
│   │   ├── OrderEventHandler.cs
│   │   ├── ProductEventHandler.cs
│   │   └── UserEventHandler.cs
│   ├── Queries/
│   │   ├── GetSalesReportQuery.cs
│   │   ├── GetTrafficAnalyticsQuery.cs
│   │   └── GetConversionFunnelQuery.cs
│   ├── Jobs/
│   │   ├── DailyAggregationJob.cs
│   │   └── HourlyAggregationJob.cs
│   └── DTOs/
├── Infrastructure/
│   ├── Persistence/
│   │   ├── AnalyticsDbContext.cs
│   │   └── Migrations/
│   ├── DataLake/
│   │   └── EventWriter.cs
│   ├── Synapse/
│   │   └── AggregationClient.cs
│   └── Repositories/
│       └── AnalyticsRepository.cs
├── API/
│   ├── Controllers/
│   │   ├── ReportsController.cs
│   │   └── DashboardController.cs
│   └── Models/
└── Dockerfile
```

### 10.4 API Design

GET /api/analytics/dashboard: Get dashboard summary data including revenue today, orders today, active users, conversion rate, and top products. Returns pre aggregated data refreshed every 15 minutes.

GET /api/analytics/sales: Get sales report with date range filtering. Query parameters include from, to, groupBy (day, week, month), and segmentBy (category, product, region).

GET /api/analytics/products/{id}/performance: Get product performance metrics including views, add to cart rate, purchase rate, and revenue.

GET /api/analytics/conversion-funnel: Get the conversion funnel from product view through purchase with drop off rates at each stage.

GET /api/analytics/reports/export: Export a report as CSV or Excel for the given date range and metrics.

### 10.5 Database Design

Raw events are stored as JSON files in Azure Data Lake organized by date and event type. Aggregated data is stored in Azure Synapse Analytics with pre calculated summary tables: DailySalesSummary (Date, TotalRevenue, OrderCount, AverageOrderValue, UniqueCustomers), ProductPerformance (ProductId, Date, Views, AddToCarts, Purchases, Revenue, ConversionRate), and TrafficSourceSummary (Date, Source, Medium, Sessions, BounceRate, ConversionRate).

### 10.6 Message Flow

The service consumes domain events from Service Bus: OrderConfirmedEvent updates sales aggregates, ProductViewedEvent (published by the gateway) updates product view counts, ItemAddedToCartEvent updates cart conversion metrics, UserRegisteredEvent updates user acquisition metrics, and PaymentProcessedEvent updates revenue recognition data.

### 10.7 Dependencies and Communication

The Analytics Service depends on Azure Data Lake for raw event storage, Azure Synapse Analytics for aggregated data, Azure SQL Database for metadata, and Azure Service Bus for event consumption.

### 10.8 Scaling Strategy

The Analytics Service runs 2 replicas for the API layer. Event consumption and aggregation jobs run as background services. Because analytics is not real time critical, resource allocation can be lower than transactional services.

### 10.9 Security

All endpoints require admin role. No customer data is exposed through analytics APIs. Aggregated data contains no personally identifiable information.

### 10.10 Failure Scenarios

If event consumption falls behind, events are buffered in Service Bus. If aggregation jobs fail, the last successful aggregation is used and a manual re-aggregation can be triggered. If Data Lake is unavailable, events are temporarily stored locally and flushed when connectivity returns.

### 10.11 Deployment

Kubernetes Deployment with 2 replicas.

### 10.12 Observability

Metrics include event ingestion rate, aggregation job duration, query response time, and data freshness lag.

### 10.13 Testing

Unit tests cover aggregation logic. Integration tests verify event processing and query responses.

### 10.14 Versioning

API version 1.0.0.

### 10.15 Future Improvements

Real time analytics with streaming aggregation, machine learning models for demand forecasting, customer lifetime value calculation, and automated anomaly detection for business metrics.

---

## 11. Shared Patterns

### 11.1 Clean Architecture

Every microservice in CloudMart follows Clean Architecture principles. This means dependencies point inward: the domain layer has no dependencies on other layers, the application layer depends only on the domain layer, the infrastructure layer depends on domain and application layers, and the API layer depends on application and infrastructure layers.

This architecture ensures that business logic is isolated from framework code. I can change the database from SQL Server to PostgreSQL by modifying only the infrastructure layer. I can change from ASP.NET Core to another web framework by modifying only the API layer. The domain and application layers remain unchanged.

### 11.2 MediatR Pattern

The application layer uses MediatR to implement the mediator pattern. Controllers send commands and queries to a mediator, which routes them to the appropriate handler. This decouples controllers from handlers and enables cross cutting concerns like logging, validation, and transaction management to be implemented as pipeline behaviors.

A typical MediatR pipeline: controller calls mediator.Send(command), a validation behavior runs first and checks FluentValidation rules, a logging behavior logs the command and handler name, a transaction behavior begins a database transaction, the handler executes business logic, the transaction behavior commits if successful or rolls back if an exception occurs, and the result returns to the controller.

### 11.3 Repository Pattern

Database access is abstracted through repository interfaces defined in the domain or application layer. Concrete implementations in the infrastructure layer use Entity Framework Core. This abstraction allows unit tests to use in memory repositories and enables changing the data access technology without modifying business logic.

### 11.4 Outbox Pattern

For reliable event publishing, services use the outbox pattern. When a command modifies data and publishes an event, both the data change and the event are saved in the same database transaction. The event is saved to an Outbox table rather than being published immediately. A background job reads the outbox table and publishes events to Service Bus. If publication fails, the event remains in the outbox for retry. This ensures that events are never lost even if Service Bus is temporarily unavailable.

### 11.5 Event Sourcing Considerations

The Order Service uses event sourcing for the order aggregate. Other services use traditional CRUD with outbox pattern for events. Event sourcing provides an immutable audit trail and enables temporal queries. However, it adds complexity: read models must be projected from events, event schema evolution requires careful handling, and developers must think in terms of state transitions rather than current state.

I chose event sourcing only for orders because orders require audit trails and have complex state machines. For simpler entities like user profiles, traditional CRUD is sufficient.

### 11.6 API Versioning Strategy

All services use URL path versioning: /api/v1/products. When a breaking change is needed, a new version is introduced at /api/v2/products while v1 continues to be supported for a deprecation period of at least 6 months. Versioning is implemented through ASP.NET Core API versioning middleware which routes requests to the appropriate controller based on the path.

### 11.7 Cross Cutting Concerns

Every service implements these cross cutting concerns consistently: structured logging with Serilog using JSON format, distributed tracing with OpenTelemetry automatically propagated through HTTP headers and message bus properties, health checks at /health/live and /health/ready, metrics exposed at /metrics in Prometheus format, request validation using FluentValidation, global exception handling middleware that converts exceptions to ProblemDetails responses, and correlation ID propagation across all operations.

---

## What I Have Accomplished in This Volume

This volume provided exhaustive documentation for every microservice in the CloudMart platform. I documented the API Gateway with its routing and middleware pipeline, the Auth Service with B2C integration and token management, the User Service with profile and address management, the Product Service with catalog and search integration, the Cart Service with its hybrid Redis/SQL storage, the Order Service with saga orchestration and event sourcing, the Payment Service with Stripe integration and idempotency, the Inventory Service with optimistic locking and reservation patterns, the Notification Service with multi channel delivery, and the Analytics Service with event aggregation.

For each service I covered: purpose and responsibilities, internal architecture with layer descriptions, complete folder structures, detailed API designs with endpoint specifications, database schemas with table definitions, message flows showing event publishing and consumption, dependencies and communication patterns, scaling strategies with trigger definitions, security considerations, failure scenarios with handling approaches, deployment configurations, observability requirements, testing strategies, versioning approaches, and future improvement ideas.

I also documented shared patterns used across all services: Clean Architecture, MediatR, Repository pattern, Outbox pattern, Event Sourcing considerations, API versioning, and cross cutting concerns.

**DevOps skills learned in this volume:** Microservice design patterns, Clean Architecture, CQRS, Saga pattern, Outbox pattern, Event Sourcing, API design, database per service pattern, eventual consistency handling, service decomposition, and inter service communication design.

**Interview questions this prepares me for:** How do you decompose a monolith into microservices? How do you handle distributed transactions? What is the saga pattern and when do you use it? How do you ensure reliable event delivery? What is the outbox pattern? How do you design APIs for microservices? What database patterns work best for microservices?

**Real world engineering problem this solves:** Building and documenting microservices is the daily work of platform engineers and software architects. This volume demonstrates the depth of design required before writing code. It shows how to make technology choices, define service boundaries, design APIs, plan data storage, and handle cross cutting concerns consistently.

**Azure services being mastered:** Azure SQL Database design, Azure Service Bus messaging patterns, Redis caching strategies, Azure AI Search integration, Azure Blob Storage usage, Azure AD B2C application integration.

**DevOps concepts being mastered:** Microservices architecture, Clean Architecture, CQRS, Saga pattern, Outbox pattern, Event Sourcing, API versioning, health check design, metrics design, structured logging, distributed tracing, and repository pattern.

---

End of Volume 3