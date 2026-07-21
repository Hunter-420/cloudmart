# Volume 11: Complete Database Design

## The Purpose of This Volume

This volume documents the complete database design for the CloudMart platform. While Volume 3 described the database schema for each microservice at a high level, this volume dives into the relational database design in exhaustive detail: entity relationship diagrams, normalization decisions, indexing strategies, constraint design, transaction patterns, performance optimization, partitioning strategies, scaling approaches, and caching patterns.

Database design is a fundamental skill for platform engineers because data is the most valuable asset of any business. Poor database design causes performance problems that are expensive to fix. Good database design enables the application to scale and perform efficiently.

---

## Detailed Table of Contents

1. Database Architecture Overview
   1.1 Database Per Service Pattern
   1.2 Why Azure SQL Database
   1.3 Data Ownership Boundaries
   1.4 Cross Service Data Patterns
   1.5 DevOps Skills Learned

2. User Database Design
   2.1 Entity Relationship Diagram
   2.2 Table Definitions
   2.3 Normalization Analysis
   2.4 Indexes
   2.5 Constraints
   2.6 DevOps Skills Learned

3. Product Database Design
   3.1 Entity Relationship Diagram
   3.2 Table Definitions
   3.3 Normalization Analysis
   3.4 Indexes
   3.5 Full Text Search Integration
   3.6 DevOps Skills Learned

4. Order Database Design
   4.1 Entity Relationship Diagram
   4.2 Table Definitions
   4.3 Event Store Design
   4.4 Read Model Projections
   4.5 Indexes
   4.6 DevOps Skills Learned

5. Cart Database Design
   5.1 Entity Relationship Diagram
   5.2 Table Definitions
   5.3 Session Management
   5.4 Expiration Strategy
   5.5 DevOps Skills Learned

6. Payment Database Design
   6.1 Entity Relationship Diagram
   6.2 Table Definitions
   6.3 Idempotency Implementation
   6.4 Reconciliation Support
   6.5 DevOps Skills Learned

7. Inventory Database Design
   7.1 Entity Relationship Diagram
   7.2 Table Definitions
   7.3 Concurrency Control
   7.4 Indexes
   7.5 DevOps Skills Learned

8. Notification Database Design
   8.1 Entity Relationship Diagram
   8.2 Table Definitions
   8.3 Template Storage
   8.4 Delivery Tracking
   8.5 DevOps Skills Learned

9. Transaction Design
   9.1 ACID Properties
   9.2 Transaction Boundaries
   9.3 Isolation Levels
   9.4 Distributed Transactions
   9.5 Saga Implementation
   9.6 DevOps Skills Learned

10. Indexing Strategy
    10.1 Index Types
    10.2 Clustered vs Non Clustered
    10.3 Composite Indexes
    10.4 Covering Indexes
    10.5 Index Maintenance
    10.6 DevOps Skills Learned

11. Performance Optimization
    11.1 Query Optimization
    11.2 Connection Pooling
    11.3 Read Replicas
    11.4 Query Store Analysis
    11.5 Execution Plans
    11.6 DevOps Skills Learned

12. Partitioning Strategy
    12.1 Partitioning Concepts
    12.2 Horizontal Partitioning
    12.3 Partitioning by Date
    12.4 Partition Management
    12.5 DevOps Skills Learned

13. Scaling Strategy
    13.1 Vertical Scaling
    13.2 Read Scaling
    13.3 Geo Replication
    13.4 Sharding Considerations
    13.5 DevOps Skills Learned

14. Caching Strategy
    14.1 Cache Layers
    14.2 Cache Invalidation
    14.3 Cache Warming
    14.4 Cache Patterns
    14.5 DevOps Skills Learned

---

## 1. Database Architecture Overview

### 1.1 Database Per Service Pattern

CloudMart follows the database per service pattern. Each microservice owns its data store and no service accesses another service's database directly. This provides: loose coupling (services can change their schema without impacting others), technology freedom (each service chooses the best storage for its needs), and independent scaling (services scale their data stores independently).

Services and their databases: Auth Service (User DB), User Service (User DB), Product Service (Product DB), Cart Service (Cart DB), Order Service (Order DB), Payment Service (Payment DB), Inventory Service (Inventory DB), Notification Service (Notification DB), and Analytics Service (Data Lake and Synapse).

### 1.2 Why Azure SQL Database

Azure SQL Database is chosen for transactional services because: it provides ACID transactions for data consistency, it is fully managed (automatic patching, backups, high availability), it integrates with Azure AD for authentication, it supports geo replication for disaster recovery, and it offers excellent performance monitoring through Query Store.

For analytics, Azure Data Lake and Synapse Analytics provide better performance for large scale analytical queries.

### 1.3 Data Ownership Boundaries

Each database is owned by exactly one service. The Product Service owns the Product DB. No other service writes to it. Other services read product data through the Product Service API. This prevents data corruption from cross service writes and ensures consistency within each domain.

### 1.4 Cross Service Data Patterns

When services need data from other services, they use: API calls for synchronous reads (Order Service calls Product Service for product details), event driven updates for asynchronous propagation (Inventory Service publishes stock events that Product Service consumes), and CQRS for read optimized data (Analytics Service maintains aggregated views from event streams).

### 1.5 DevOps Skills Learned

Database architecture teaches me distributed data management, consistency tradeoffs, and microservices data patterns. These skills are essential for platform design.

---

## 2. User Database Design

### 2.1 Entity Relationship Diagram

```
[UserAccounts] 1---* [UserProfiles]
[UserAccounts] 1---* [RefreshTokens]
[UserAccounts] 1---* [UserRoles]
[UserProfiles] 1---* [Addresses]
[UserProfiles] 1---1 [NotificationPreferences]
```

### 2.2 Table Definitions

UserAccounts: Id (UNIQUEIDENTIFIER, PK), B2CObjectId (NVARCHAR(36), unique, not null), Email (NVARCHAR(255), unique, not null), CreatedAt (DATETIME2, not null), UpdatedAt (DATETIME2, not null), IsActive (BIT, default 1).

UserProfiles: Id (UNIQUEIDENTIFIER, PK), UserAccountId (UNIQUEIDENTIFIER, FK to UserAccounts.Id), FirstName (NVARCHAR(100)), LastName (NVARCHAR(100)), Phone (NVARCHAR(20)), DateOfBirth (DATE), Preferences (NVARCHAR(MAX) containing JSON), CreatedAt (DATETIME2), UpdatedAt (DATETIME2).

RefreshTokens: Id (UNIQUEIDENTIFIER, PK), TokenHash (NVARCHAR(64), not null), UserAccountId (UNIQUEIDENTIFIER, FK), IssuedAt (DATETIME2), ExpiresAt (DATETIME2), RevokedAt (DATETIME2, nullable), ReplacedByTokenId (UNIQUEIDENTIFIER, nullable, self referencing).

UserRoles: UserAccountId (UNIQUEIDENTIFIER, FK), Role (NVARCHAR(50)), AssignedAt (DATETIME2). PK is composite (UserAccountId, Role).

Addresses: Id (UNIQUEIDENTIFIER, PK), UserProfileId (UNIQUEIDENTIFIER, FK), Street (NVARCHAR(255)), City (NVARCHAR(100)), State (NVARCHAR(50)), PostalCode (NVARCHAR(20)), Country (NVARCHAR(2)), IsDefaultShipping (BIT), IsDefaultBilling (BIT), CreatedAt (DATETIME2).

NotificationPreferences: Id (UNIQUEIDENTIFIER, PK), UserProfileId (UNIQUEIDENTIFIER, FK), EmailOptIn (BIT, default 1), SmsOptIn (BIT, default 0), MarketingOptIn (BIT, default 1), OrderUpdatesOptIn (BIT, default 1), CreatedAt (DATETIME2), UpdatedAt (DATETIME2).

### 2.3 Normalization Analysis

The User DB is in Third Normal Form (3NF): every table has a primary key, no repeating groups, no partial dependencies, and no transitive dependencies. User profiles are separated from accounts because they have different access patterns and update frequencies. Addresses are in a separate table because a user can have multiple addresses. Roles are in a separate table because a user can have multiple roles.

### 2.4 Indexes

UserAccounts: clustered index on Id, non clustered unique index on B2CObjectId, non clustered unique index on Email.

UserProfiles: clustered index on Id, non clustered index on UserAccountId.

RefreshTokens: clustered index on Id, non clustered index on TokenHash, non clustered index on UserAccountId where RevokedAt is null.

Addresses: clustered index on Id, non clustered index on UserProfileId.

### 2.5 Constraints

Foreign keys with cascade delete: UserProfiles.UserAccountId references UserAccounts.Id (cascade delete), Addresses.UserProfileId references UserProfiles.Id (cascade delete). Check constraint: RefreshTokens.ExpiresAt > RefreshTokens.IssuedAt.

### 2.6 DevOps Skills Learned

User database design teaches me identity data modeling, normalization, and relationship design. These skills apply to any user management system.

---

## 3. Product Database Design

### 3.1 Entity Relationship Diagram

```
[Categories] 1---* [Categories] (self referencing for hierarchy)
[Categories] 1---* [Products]
[Products] 1---* [ProductVariants]
[Products] 1---* [ProductImages]
[Products] 1---* [ProductReviews]
[Products] *---* [ProductCategories] (many to many)
```

### 3.2 Table Definitions

Categories: Id (UNIQUEIDENTIFIER, PK), Name (NVARCHAR(200), not null), Slug (NVARCHAR(200), unique, not null), ParentId (UNIQUEIDENTIFIER, FK to Categories.Id, nullable), Description (NVARCHAR(1000)), ImageUrl (NVARCHAR(500)), SortOrder (INT), IsActive (BIT, default 1), CreatedAt (DATETIME2).

Products: Id (UNIQUEIDENTIFIER, PK), Name (NVARCHAR(300), not null), Slug (NVARCHAR(300), unique, not null), Description (NVARCHAR(MAX)), ShortDescription (NVARCHAR(500)), BasePrice (DECIMAL(18,2), not null), CompareAtPrice (DECIMAL(18,2)), IsActive (BIT, default 1), CreatedAt (DATETIME2), UpdatedAt (DATETIME2).

ProductVariants: Id (UNIQUEIDENTIFIER, PK), ProductId (UNIQUEIDENTIFIER, FK), SKU (NVARCHAR(50), unique, not null), VariantName (NVARCHAR(200)), PriceAdjustment (DECIMAL(18,2), default 0), Weight (DECIMAL(10,3)), IsActive (BIT, default 1).

ProductImages: Id (UNIQUEIDENTIFIER, PK), ProductId (UNIQUEIDENTIFIER, FK), VariantId (UNIQUEIDENTIFIER, FK, nullable), ImageUrl (NVARCHAR(500), not null), AltText (NVARCHAR(200)), SortOrder (INT), IsPrimary (BIT, default 0).

ProductReviews: Id (UNIQUEIDENTIFIER, PK), ProductId (UNIQUEIDENTIFIER, FK), UserId (UNIQUEIDENTIFIER, not null), Rating (INT, not null, check 1-5), Title (NVARCHAR(200)), Body (NVARCHAR(2000)), IsVerifiedPurchase (BIT, default 0), HelpfulCount (INT, default 0), CreatedAt (DATETIME2).

### 3.3 Normalization Analysis

Product data is in 3NF. Categories are self referencing for hierarchical navigation. ProductVariants separates variant specific data (SKU, price adjustment) from the base product. ProductReviews contains denormalized UserId rather than a foreign key to the User DB because the User DB is in a different service.

### 3.4 Indexes

Products: clustered on Id, non clustered on Slug, non clustered on IsActive + UpdatedAt for cache invalidation queries.

ProductVariants: clustered on Id, non clustered on ProductId, unique on SKU.

ProductReviews: clustered on Id, non clustered on ProductId + CreatedAt for recent reviews query.

### 3.5 Full Text Search Integration

Product name and description are indexed by Azure AI Search rather than SQL full text search. This provides better relevance scoring, faceting, and typo tolerance. The search index is populated by the Product Service pushing documents to Azure AI Search.

### 3.6 DevOps Skills Learned

Product database design teaches me e commerce catalog modeling, hierarchical data, and search integration patterns.

---

## 4. Order Database Design

### 4.1 Entity Relationship Diagram

```
[Orders] 1---* [OrderItems]
[Orders] 1---* [OrderStatusHistory]
[Orders] 1---1 [Payments] (reference, not FK)
[Orders] 1---* [OrderEvents] (event store)
```

### 4.2 Table Definitions

Orders: Id (UNIQUEIDENTIFIER, PK), OrderNumber (NVARCHAR(20), unique, not null), UserId (UNIQUEIDENTIFIER, not null), Status (NVARCHAR(20), not null), Subtotal (DECIMAL(18,2)), Tax (DECIMAL(18,2)), Shipping (DECIMAL(18,2)), Discount (DECIMAL(18,2)), Total (DECIMAL(18,2)), ShippingAddress (NVARCHAR(MAX), JSON), PaymentIntentId (NVARCHAR(100)), CreatedAt (DATETIME2), UpdatedAt (DATETIME2).

OrderItems: Id (UNIQUEIDENTIFIER, PK), OrderId (UNIQUEIDENTIFIER, FK), ProductId (UNIQUEIDENTIFIER, not null), VariantId (UNIQUEIDENTIFIER, not null), ProductName (NVARCHAR(300)), SKU (NVARCHAR(50)), Quantity (INT), UnitPrice (DECIMAL(18,2)), TotalPrice (DECIMAL(18,2)).

OrderStatusHistory: Id (UNIQUEIDENTIFIER, PK), OrderId (UNIQUEIDENTIFIER, FK), Status (NVARCHAR(20)), ChangedAt (DATETIME2), ChangedBy (NVARCHAR(100)), Reason (NVARCHAR(500)).

### 4.3 Event Store Design

OrderEvents: Id (BIGINT, PK, IDENTITY), AggregateId (UNIQUEIDENTIFIER, not null), AggregateType (NVARCHAR(100)), EventType (NVARCHAR(200)), EventData (NVARCHAR(MAX), JSON), SequenceNumber (INT, not null), OccurredAt (DATETIME2).

Unique constraint on (AggregateId, SequenceNumber) ensures ordering. Events are append only. The SequenceNumber determines event order within an aggregate.

### 4.4 Read Model Projections

OrderReadModel: Id (UNIQUEIDENTIFIER, PK), OrderId (UNIQUEIDENTIFIER, not null), UserId (UNIQUEIDENTIFIER, not null), Status (NVARCHAR(20)), Total (DECIMAL(18,2)), ItemCount (INT), CreatedAt (DATETIME2), LastUpdated (DATETIME2).

This projection is updated asynchronously from the event stream. It is optimized for query performance with indexes on UserId and Status.

### 4.5 Indexes

Orders: clustered on Id, unique on OrderNumber, non clustered on UserId + CreatedAt for order history queries.

OrderEvents: clustered on Id, non clustered on AggregateId + SequenceNumber.

OrderReadModel: clustered on Id, non clustered on UserId, non clustered on Status.

### 4.6 DevOps Skills Learned

Order database design teaches me event sourcing, CQRS, and transactional data modeling. These patterns are essential for systems requiring audit trails and complex state machines.

---

## 5. Cart Database Design

### 5.1 Entity Relationship Diagram

```
[Carts] 1---* [CartItems]
```

### 5.2 Table Definitions

Carts: Id (UNIQUEIDENTIFIER, PK), UserId (UNIQUEIDENTIFIER, nullable), SessionId (NVARCHAR(100), nullable), Status (NVARCHAR(20), not null), PromotionCode (NVARCHAR(50)), PromotionDiscount (DECIMAL(18,2)), CreatedAt (DATETIME2), UpdatedAt (DATETIME2), ExpiresAt (DATETIME2).

CartItems: Id (UNIQUEIDENTIFIER, PK), CartId (UNIQUEIDENTIFIER, FK), ProductId (UNIQUEIDENTIFIER, not null), VariantId (UNIQUEIDENTIFIER, not null), Quantity (INT, not null), UnitPrice (DECIMAL(18,2)), LineTotal (DECIMAL(18,2)), AddedAt (DATETIME2).

### 5.3 Session Management

Guest carts use SessionId (stored in a secure HTTP only cookie). Authenticated carts use UserId. When a user logs in, guest carts are merged into the authenticated cart by summing quantities for matching product/variant combinations.

### 5.4 Expiration Strategy

Carts expire after 24 hours of inactivity for guest carts and 7 days for authenticated carts. A background job deletes expired carts daily. The Redis cache has TTL set to match the expiration.

### 5.5 DevOps Skills Learned

Cart database design teaches me session management patterns and transient data handling.

---

## 6. Payment Database Design

### 6.1 Entity Relationship Diagram

```
[Payments] 1---* [Refunds]
[Payments] 1---* [PaymentMethods]
```

### 6.2 Table Definitions

Payments: Id (UNIQUEIDENTIFIER, PK), OrderId (UNIQUEIDENTIFIER, not null), StripePaymentIntentId (NVARCHAR(100), not null), Amount (DECIMAL(18,2)), Currency (NVARCHAR(3)), Status (NVARCHAR(20)), PaymentMethodType (NVARCHAR(50)), FailureReason (NVARCHAR(500)), IdempotencyKey (NVARCHAR(100), unique), CreatedAt (DATETIME2), UpdatedAt (DATETIME2).

Refunds: Id (UNIQUEIDENTIFIER, PK), PaymentId (UNIQUEIDENTIFIER, FK), StripeRefundId (NVARCHAR(100)), Amount (DECIMAL(18,2)), Reason (NVARCHAR(500)), Status (NVARCHAR(20)), CreatedAt (DATETIME2).

PaymentMethods: Id (UNIQUEIDENTIFIER, PK), UserId (UNIQUEIDENTIFIER, not null), StripePaymentMethodId (NVARCHAR(100)), Type (NVARCHAR(50)), LastFourDigits (NVARCHAR(4)), ExpiryMonth (INT), ExpiryYear (INT), IsDefault (BIT), CreatedAt (DATETIME2).

### 6.3 Idempotency Implementation

The IdempotencyKey column ensures duplicate payment requests are not processed. When a payment request arrives, the system checks if the idempotency key exists. If found, it returns the stored result. If not found, it processes the payment and stores the result with the key.

### 6.4 Reconciliation Support

Payments and Refunds tables store Stripe IDs for reconciliation. A daily job compares internal records with Stripe API data to detect discrepancies.

### 6.5 DevOps Skills Learned

Payment database design teaches me financial data modeling, idempotency patterns, and reconciliation support. These skills are critical for payment processing systems.

---

## 7. Inventory Database Design

### 7.1 Entity Relationship Diagram

```
[InventoryItems] 1---* [Reservations]
[InventoryItems] 1---* [StockMovements]
```

### 7.2 Table Definitions

InventoryItems: Id (UNIQUEIDENTIFIER, PK), SKU (NVARCHAR(50), unique, not null), ProductId (UNIQUEIDENTIFIER, not null), VariantId (UNIQUEIDENTIFIER, not null), TotalStock (INT, not null), ReservedStock (INT, not null, default 0), ReorderThreshold (INT, default 10), ReorderQuantity (INT, default 50), LastUpdated (DATETIME2), RowVersion (ROWVERSION).

Reservations: Id (UNIQUEIDENTIFIER, PK), OrderId (UNIQUEIDENTIFIER, not null), SKU (NVARCHAR(50), FK to InventoryItems.SKU), Quantity (INT, not null), Status (NVARCHAR(20)), CreatedAt (DATETIME2), ExpiresAt (DATETIME2), CommittedAt (DATETIME2, nullable).

StockMovements: Id (UNIQUEIDENTIFIER, PK), SKU (NVARCHAR(50)), MovementType (NVARCHAR(20)), Quantity (INT), PreviousStock (INT), NewStock (INT), Reason (NVARCHAR(500)), CreatedAt (DATETIME2).

### 7.3 Concurrency Control

The RowVersion column implements optimistic locking. When updating inventory, the WHERE clause includes the RowVersion. If another transaction modified the row, the update fails and the operation retries.

### 7.4 Indexes

InventoryItems: clustered on Id, unique on SKU, non clustered on ProductId + VariantId.

Reservations: clustered on Id, non clustered on OrderId, non clustered on SKU + Status for active reservations.

### 7.5 DevOps Skills Learned

Inventory database design teaches me concurrency control, optimistic locking, and inventory management patterns. These skills apply to any system managing shared resources.

---

## 8. Notification Database Design

### 8.1 Entity Relationship Diagram

```
[NotificationTemplates] 1---* [Notifications]
```

### 8.2 Table Definitions

Notifications: Id (UNIQUEIDENTIFIER, PK), UserId (UNIQUEIDENTIFIER, not null), Type (NVARCHAR(50)), Channel (NVARCHAR(20)), Subject (NVARCHAR(500)), Body (NVARCHAR(MAX)), Status (NVARCHAR(20)), SentAt (DATETIME2, nullable), DeliveredAt (DATETIME2, nullable), OpenedAt (DATETIME2, nullable), ClickedAt (DATETIME2, nullable), ErrorMessage (NVARCHAR(500), nullable).

NotificationTemplates: Id (UNIQUEIDENTIFIER, PK), Name (NVARCHAR(100), unique), SubjectTemplate (NVARCHAR(500)), BodyTemplate (NVARCHAR(MAX)), Channel (NVARCHAR(20)), VariablesSchema (NVARCHAR(MAX), JSON), CreatedAt (DATETIME2), UpdatedAt (DATETIME2).

### 8.3 Template Storage

Templates use the Scriban templating engine. Variables are defined in JSON schema. Templates are versioned: updates create new versions rather than modifying existing templates.

### 8.4 Delivery Tracking

Status transitions: PENDING -> SENDING -> SENT -> DELIVERED -> OPENED/CLICKED. Failed deliveries transition to FAILED with error message. Bounces are tracked through webhook callbacks from SendGrid.

### 8.5 DevOps Skills Learned

Notification database design teaches me template management and delivery tracking patterns.

---

## 9. Transaction Design

### 9.1 ACID Properties

Azure SQL Database guarantees ACID transactions: Atomicity (all operations in a transaction succeed or all fail), Consistency (database remains in a valid state), Isolation (concurrent transactions do not interfere), and Durability (committed transactions survive system failures).

### 9.2 Transaction Boundaries

Transactions are scoped to a single service's database. When the Order Service creates an order, it uses a transaction to insert the order and order items atomically. Cross service operations use the saga pattern rather than distributed transactions.

### 9.3 Isolation Levels

CloudMart uses READ COMMITTED as the default isolation level. This prevents dirty reads while allowing concurrency. For inventory operations, SERIALIZABLE or Snapshot isolation is used to prevent lost updates.

### 9.4 Distributed Transactions

CloudMart avoids distributed transactions (two phase commit) because they are complex, slow, and couple services. Instead, the saga pattern provides eventual consistency through compensating transactions.

### 9.5 Saga Implementation

The order saga: create order (local transaction), reserve inventory (call Inventory Service, compensate by releasing), process payment (call Payment Service, compensate by refunding), and confirm order (local transaction). If any step fails, compensating actions undo previous steps.

### 9.6 DevOps Skills Learned

Transaction design teaches me ACID properties, isolation levels, and distributed consistency patterns. These skills are essential for reliable data systems.

---

## 10. Indexing Strategy

### 10.1 Index Types

Clustered indexes determine the physical order of data (one per table). Non clustered indexes create separate structures for fast lookups. Unique indexes enforce uniqueness. Filtered indexes cover a subset of data.

### 10.2 Clustered vs Non Clustered

Primary keys use clustered indexes for efficient range queries. Foreign keys and frequently queried columns use non clustered indexes. The Orders table has a clustered index on Id and non clustered indexes on OrderNumber and UserId.

### 10.3 Composite Indexes

Composite indexes cover multiple columns. The order of columns matters: put the most selective column first. ProductReviews has a composite index on (ProductId, CreatedAt) for querying recent reviews of a product.

### 10.4 Covering Indexes

A covering index includes all columns needed for a query, eliminating the need to look up the table. The OrderReadModel has a covering index on (UserId, Status, CreatedAt) for the common query pattern of listing a user's orders filtered by status.

### 10.5 Index Maintenance

Azure SQL Database performs automatic index maintenance. Additionally: rebuild indexes weekly during maintenance windows, monitor index fragmentation through sys.dm_db_index_physical_stats, and remove unused indexes identified by Query Store.

### 10.6 DevOps Skills Learned

Indexing strategy teaches me query performance optimization, index selection, and maintenance procedures. These skills directly impact application performance.

---

## 11. Performance Optimization

### 11.1 Query Optimization

Optimize queries by: selecting only needed columns (avoid SELECT *), using appropriate indexes, parameterizing queries to enable plan reuse, avoiding N+1 queries through eager loading or batching, and using EXPLAIN to analyze execution plans.

### 11.2 Connection Pooling

Entity Framework Core maintains a connection pool. Pool size is configured to match expected concurrency. Too small causes connection waits. Too large wastes resources. CloudMart uses the default pool size of 100 with a max lifetime of 5 minutes.

### 11.3 Read Replicas

Business Critical tier provides read replicas. Read only queries (reporting, analytics) are directed to replicas, reducing load on the primary. CloudMart uses read replicas for the Product Service search queries and Analytics Service aggregations.

### 11.4 Query Store Analysis

Query Store captures query performance metrics: execution count, duration, CPU usage, and logical reads. Review Query Store weekly to identify: queries with high CPU usage, queries with regressing performance, and queries that should have indexes added.

### 11.5 Execution Plans

Execution plans show how SQL Server executes a query. Key indicators: table scans (missing index), key lookups (consider covering index), sorts (may benefit from pre sorting), and nested loops vs hash joins (check cardinality estimates).

### 11.6 DevOps Skills Learned

Performance optimization teaches me query tuning, connection management, and performance monitoring. These skills are essential for database administration.

---

## 12. Partitioning Strategy

### 12.1 Partitioning Concepts

Partitioning splits large tables into smaller, manageable pieces. Queries that filter on the partition key can eliminate irrelevant partitions (partition elimination), improving performance.

### 12.2 Horizontal Partitioning

Azure SQL Database supports table partitioning based on a partition key. Large tables like OrderEvents are partitioned by date: each month of events is in a separate partition.

### 12.3 Partitioning by Date

OrderEvents is partitioned on OccurredAt with monthly partitions. Old partitions can be archived or compressed. Current month queries scan only the active partition.

### 12.4 Partition Management

Monthly job: create partition for next month, archive partitions older than 13 months to Blob Storage, and compress partitions older than 3 months.

### 12.5 DevOps Skills Learned

Partitioning teaches me large table management, data lifecycle management, and performance optimization for time series data.

---

## 13. Scaling Strategy

### 13.1 Vertical Scaling

Increase database tier when resource limits are reached: upgrade from General Purpose to Business Critical for better IO, increase vCores for more CPU and memory, and use Premium storage for higher throughput.

### 13.2 Read Scaling

Offload read traffic to replicas: configure up to 4 readable secondaries in Business Critical tier, use ApplicationIntent=ReadOnly in connection string, and route reporting queries to replicas.

### 13.3 Geo Replication

Active geo replication provides disaster recovery: create secondary in paired region, maintain asynchronous replication, failover manually or through auto failover groups. RPO is typically under 5 seconds.

### 13.4 Sharding Considerations

If a single database cannot handle the workload, consider sharding: shard by tenant (multi tenant scenarios), shard by geography (data residency requirements), or shard by date (time series data). Sharding adds significant complexity and is a last resort.

### 13.5 DevOps Skills Learned

Scaling strategy teaches me database capacity planning, horizontal and vertical scaling, and disaster recovery design. These skills ensure the database can grow with the business.

---

## 14. Caching Strategy

### 14.1 Cache Layers

CloudMart uses multiple cache layers: CDN caches static assets and product images at edge locations, Redis caches product listings, user sessions, and search results, and in memory caching within services stores configuration and reference data.

### 14.2 Cache Invalidation

Time based invalidation: product cache TTL is 10 minutes, session cache TTL is 24 hours. Event based invalidation: when a product is updated, the Product Service publishes a cache invalidation message. The cache layer removes the affected keys.

### 14.3 Cache Warming

After deployments or cache failures, the cache is cold and database load spikes. Cache warming pre populates frequently accessed data. The Product Service has a background job that warms the product listing cache on startup.

### 14.4 Cache Patterns

Cache aside: application checks cache first, loads from database on miss, and stores in cache. Write through: writes go to cache and database simultaneously. CloudMart uses cache aside for reads and explicit invalidation on writes.

### 14.5 DevOps Skills Learned

Caching strategy teaches me cache architecture, invalidation patterns, and performance optimization. These skills are essential for high performance applications.

---

## What I Have Accomplished in This Volume

This volume documented the complete database design for CloudMart. I covered database architecture with the database per service pattern, user database with profiles, addresses, and authentication data, product database with categories, variants, reviews, and images, order database with event sourcing and CQRS patterns, cart database with session management, payment database with idempotency and reconciliation, inventory database with optimistic locking, notification database with template management, transaction design with ACID properties and saga patterns, indexing strategy with clustered, non clustered, and composite indexes, performance optimization with Query Store and execution plans, partitioning strategy for large tables, scaling strategy with read replicas and geo replication, and caching strategy with multiple cache layers.

**DevOps skills learned in this volume:** Database design, normalization, indexing, query optimization, transaction management, event sourcing, CQRS, concurrency control, partitioning, scaling, and caching.

**Interview questions this prepares me for:** How do you design a database for microservices? What is event sourcing and when would you use it? How do you handle distributed transactions? What is optimistic locking? How do you optimize slow queries? What is the difference between vertical and horizontal scaling? How do you implement caching?

**Real world engineering problem this solves:** Database design directly impacts application performance, scalability, and reliability. Poor design causes production incidents. This volume provides the knowledge to design databases that perform well under load and grow with the business.

**Azure services being mastered:** Azure SQL Database, Azure SQL Query Store, Azure Cache for Redis.

**DevOps concepts being mastered:** Database design, normalization, indexing, transactions, event sourcing, CQRS, concurrency control, partitioning, and caching.

---

End of Volume 11