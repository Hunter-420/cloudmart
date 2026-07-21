# Volume 4: Azure Infrastructure Deep Dive

## The Purpose of This Volume

This volume provides comprehensive documentation for every Azure service used in the CloudMart platform. While previous volumes described what each service does in the context of the application, this volume explains the services themselves: their internal architecture, configuration options, pricing models, security features, monitoring capabilities, and best practices.

Understanding Azure services at this depth is essential for making informed architectural decisions, optimizing costs, troubleshooting issues, and passing Azure certification exams. When something breaks in production, I need to understand how the underlying service works to diagnose and fix it effectively.

This volume also serves as a reference that I can return to when configuring new services or optimizing existing ones.

---

## Detailed Table of Contents

1. Azure Fundamentals
   1.1 The Azure Platform Architecture
   1.2 Regions and Availability Zones
   1.3 Resource Organization
   1.4 Azure Resource Manager
   1.5 Azure Portal, CLI, and PowerShell
   1.6 DevOps Skills Learned

2. Resource Groups
   2.1 Purpose and Design
   2.2 Lifecycle Management
   2.3 Resource Tagging Strategy
   2.4 Locking and Governance
   2.5 DevOps Skills Learned

3. Virtual Networks
   3.1 VNET Architecture
   3.2 Address Space Design
   3.3 Subnet Design Patterns
   3.4 Network Security Groups
   3.5 Route Tables and UDRs
   3.6 Private Endpoints
   3.7 VNET Peering and Integration
   3.8 DevOps Skills Learned

4. Azure Kubernetes Service
   4.1 AKS Architecture
   4.2 Control Plane
   4.3 Node Pools and VM Sizes
   4.4 Networking Models
   4.5 Storage Integration
   4.6 Identity and Access
   4.7 Auto Scaling
   4.8 Upgrades and Maintenance
   4.9 DevOps Skills Learned

5. Container Registry
   5.1 ACR Tiers and Features
   5.2 Repository Management
   5.3 Image Lifecycle
   5.4 Geo Replication
   5.5 Security and Scanning
   5.6 Integration with AKS
   5.7 DevOps Skills Learned

6. Azure SQL Database
   6.1 Architecture and Tiers
   6.2 Purchasing Models
   6.3 High Availability
   6.4 Geo Replication
   6.5 Backup and Recovery
   6.6 Security Features
   6.7 Performance Optimization
   6.8 DevOps Skills Learned

7. Azure Cache for Redis
   7.1 Architecture and Tiers
   7.2 Data Types and Use Cases
   7.3 Persistence Options
   7.4 Clustering
   7.5 Security
   7.6 Performance Tuning
   7.7 DevOps Skills Learned

8. Azure Service Bus
   8.1 Messaging Patterns
   8.2 Queues vs Topics
   8.3 Subscriptions and Filters
   8.4 Dead Letter Handling
   8.5 Sessions and Ordering
   8.6 Geo Disaster Recovery
   8.7 DevOps Skills Learned

9. Application Gateway
   9.1 Architecture and Components
   9.2 WAF Policies
   9.3 SSL and Certificates
   9.4 Routing Rules
   9.5 Health Probes
   9.6 Scaling and Performance
   9.7 DevOps Skills Learned

10. Azure Key Vault
    10.1 Vault Architecture
    10.2 Secret Management
    10.3 Key Management
    10.4 Certificate Management
    10.5 Access Policies and RBAC
    10.6 Integration with AKS
    10.7 DevOps Skills Learned

11. Azure Monitor and Log Analytics
    11.1 Metrics Platform
    11.2 Log Analytics Workspace
    11.3 Application Insights
    11.4 Alert Rules
    11.5 Dashboards and Workbooks
    11.6 DevOps Skills Learned

12. Azure Blob Storage
    13.1 Storage Tiers
    13.2 Blob Types
    13.3 Lifecycle Management
    13.4 Security and Access Control
    13.5 CDN Integration
    13.6 DevOps Skills Learned

13. Azure AI Search
    14.1 Index Architecture
    14.2 Document Processing
    14.3 Query Capabilities
    14.4 Scoring and Ranking
    14.5 Scaling
    14.6 DevOps Skills Learned

14. Azure Active Directory B2C
    15.1 Tenant Architecture
    15.2 User Flows
    15.3 Custom Policies
    15.4 Identity Providers
    15.5 Token Configuration
    15.6 DevOps Skills Learned

15. Managed Identities
    16.1 System Assigned vs User Assigned
    16.2 How They Work
    16.3 Supported Services
    16.4 Security Benefits
    16.5 DevOps Skills Learned

16. Load Balancing and Traffic Management
    17.1 Azure Load Balancer
    17.2 Traffic Manager
    17.3 Front Door
    17.4 Choosing Between Them
    17.5 DevOps Skills Learned

17. Azure DNS
    18.1 DNS Zones
    18.2 Record Types
    18.3 Alias Records
    18.4 Private DNS
    18.5 DevOps Skills Learned

18. Cost Management
    19.1 Pricing Models
    19.2 Cost Optimization
    19.3 Budgets and Alerts
    19.4 Reserved Instances
    19.5 DevOps Skills Learned

---

## 1. Azure Fundamentals

### 1.1 The Azure Platform Architecture

Microsoft Azure is a cloud computing platform consisting of over 200 services across compute, networking, storage, databases, AI, IoT, and more. At its core, Azure operates data centers globally, virtualizing physical resources into consumable services exposed through APIs.

The platform is built on a unified fabric controller that manages resource allocation, health monitoring, and maintenance across all data centers. When I provision a virtual machine, the fabric controller selects physical servers, allocates storage, configures networking, and monitors health. This abstraction means I never interact with physical hardware.

Azure services are categorized into: compute services like Virtual Machines, App Service, and AKS for running applications; data services like Azure SQL, Cosmos DB, and Storage for persisting information; networking services like VNET, Application Gateway, and Load Balancer for connectivity; identity services like Azure AD and AD B2C for authentication; and management services like Monitor, Key Vault, and Policy for operations and governance.

### 1.2 Regions and Availability Zones

Azure divides the world into regions, each consisting of one or more data centers within a defined geographic boundary. Examples include East US, West Europe, and Southeast Asia. Regions provide data residency, compliance boundaries, and network latency optimization by placing resources close to users.

Within regions, Availability Zones are physically separate data centers with independent power, cooling, and networking. Each zone is effectively a separate data center within the same region. Deploying across multiple zones protects against data center level failures. Not all regions support Availability Zones. For CloudMart, West US 2 supports three zones and is our primary region.

Region pairs are two regions within the same geography designated for disaster recovery. If one region experiences a major outage, the paired region is prioritized for resource allocation. West US 2 is paired with West Central US. For disaster recovery, we replicate to East US which provides geographic separation.

### 1.3 Resource Organization

Azure organizes resources hierarchically: subscriptions are the billing boundary and access control boundary; resource groups are logical containers for related resources; and resources are individual service instances like a VM or database.

Management groups sit above subscriptions, allowing policy and access control to be applied across multiple subscriptions. For CloudMart, we use a single subscription with separate resource groups for each environment and service type.

### 1.4 Azure Resource Manager

Azure Resource Manager (ARM) is the deployment and management service for Azure. Every request to create, update, or delete resources goes through ARM. ARM handles authentication, authorization, and API routing to the appropriate resource provider.

Resource providers are the services that implement resource types. Microsoft.Compute provides VMs, Microsoft.Sql provides databases, and Microsoft.ContainerService provides AKS. When I create a resource through Terraform, the Azure provider translates my HCL into REST API calls to ARM, which routes them to the appropriate resource provider.

ARM templates are the native JSON format for declarative resource deployment. Terraform generates ARM templates behind the scenes when deploying to Azure. Understanding ARM helps troubleshoot deployment failures because error messages reference ARM resource properties.

### 1.5 Azure Portal, CLI, and PowerShell

The Azure Portal is the web based management interface. It is useful for learning, troubleshooting, and occasional manual tasks. However, production changes should always go through infrastructure as code.

The Azure CLI is a cross platform command line tool for managing Azure resources. I use it for ad hoc queries, troubleshooting, and scripts that do not warrant full Terraform configurations. Common commands include az group list to list resource groups, az aks get credentials to configure kubectl for AKS, and az monitor metrics list to query metrics.

Azure PowerShell provides similar capabilities for Windows administrators. The choice between CLI and PowerShell is largely personal preference. I use the CLI because it works consistently across operating systems.

### 1.6 DevOps Skills Learned

Understanding Azure fundamentals enables me to navigate the platform confidently, make informed service selections, troubleshoot deployment issues, and optimize resource placement. These foundational skills are assumed knowledge for all Azure certifications.

---

## 2. Resource Groups

### 2.1 Purpose and Design

Resource groups are logical containers that hold related Azure resources. Every resource must belong to exactly one resource group. Resources in the same group share a lifecycle: they are deployed, updated, and deleted together.

For CloudMart, I organize resource groups by environment and function. In production, separate resource groups include: cloudmart prod network for VNET, NSGs, and routing; cloudmart prod aks for the Kubernetes cluster and container registry; cloudmart prod data for SQL, Redis, Service Bus, and Storage; cloudmart prod security for Key Vault and managed identities; and cloudmart prod ops for monitoring and logging.

This separation allows granular access control. Network engineers can have contributor access to the network resource group without accessing databases. Database administrators can manage the data resource group without modifying Kubernetes configuration.

### 2.2 Lifecycle Management

Resources in a group share a lifecycle. Deleting a resource group deletes all contained resources. This is powerful for environment management: I can destroy an entire development environment by deleting one resource group.

For CloudMart, the development environment is created and destroyed regularly to manage costs. Terraform defines the resource group and all contained resources. When development is complete for the day, I run terraform destroy to remove everything. The next day, terraform apply recreates it.

### 2.3 Resource Tagging Strategy

Tags are name value pairs applied to resources for organization, cost allocation, and automation. CloudMart uses a consistent tagging strategy: Environment (dev, staging, production), Project (cloudmart), Owner (team email), CostCenter (department code), and Criticality (high, medium, low).

These tags enable cost reporting by environment and project, automated shutdown of non production resources, access control policies that restrict operations based on tags, and automated backup policies that apply different retention based on criticality.

### 2.4 Locking and Governance

Resource locks prevent accidental deletion or modification. CanNotDelete allows reading and modifying but not deleting. ReadOnly allows reading but not modifying or deleting. Production resource groups have CanNotDelete locks applied to prevent accidental destruction.

Azure Policy enforces organizational standards. Policies can require specific tags, restrict allowed resource types, enforce encryption settings, and require private endpoints. For CloudMart, policies ensure all resources have the Environment tag, only approved VM sizes are used, and SQL databases have transparent data encryption enabled.

### 2.5 DevOps Skills Learned

Resource organization is a foundational Azure skill. I am learning resource group design patterns, tagging strategies for FinOps, governance through policies and locks, and lifecycle management for cost control. These skills are essential for managing Azure at scale.

---

## 3. Virtual Networks

### 3.1 VNET Architecture

An Azure Virtual Network (VNET) is a software defined network that provides isolation and segmentation for Azure resources. VNETs are private networks: traffic within a VNET does not traverse the public internet. IP addressing follows RFC 1918 private ranges: 10.0.0.0/8, 172.16.0.0/12, or 192.168.0.0/16.

CloudMart uses a single VNET in production with address space 10.0.0.0/16, providing 65,536 IP addresses. This VNET contains all production resources. Development and staging environments have separate VNETs to prevent accidental cross environment communication.

### 3.2 Address Space Design

The 10.0.0.0/16 address space is divided into subnets: GatewaySubnet (10.0.0.0/24) for Application Gateway, AKS subnet (10.0.1.0/24) for Kubernetes nodes, DB subnet (10.0.2.0/24) for database private endpoints, Bastion subnet (10.0.3.0/24) for Azure Bastion, Integration subnet (10.0.4.0/24) for service private endpoints, and Reserved (10.0.5.0/24 through 10.0.255.0/24) for future expansion.

AKS uses its own pod CIDR (10.244.0.0/16) and service CIDR (10.245.0.0/16) that do not overlap with the VNET address space. This is required when using Azure CNI networking mode.

### 3.3 Subnet Design Patterns

Subnet design follows the principle of network segmentation for security. The database subnet has no direct internet access and accepts connections only from the AKS subnet. The AKS subnet can reach the database subnet but cannot be reached directly from the internet. Application Gateway in the gateway subnet is the only entry point from the internet.

Each subnet has a Network Security Group (NSG) that controls inbound and outbound traffic. NSG rules are stateful: allowing inbound traffic on a port automatically allows the corresponding outbound response.

### 3.4 Network Security Groups

NSGs are access control lists applied to subnets or individual network interfaces. Each rule specifies priority, direction (inbound/outbound), source, destination, port, protocol, and action (allow/deny).

The AKS subnet NSG allows inbound port 443 from the Application Gateway subnet, inbound port 22 from the Bastion subnet, outbound port 1433 to the DB subnet, outbound port 6380 to the DB subnet, outbound HTTPS to the internet for Stripe API calls, and denies all other traffic.

The DB subnet NSG allows inbound port 1433 from the AKS subnet, inbound port 6380 from the AKS subnet, and denies all other inbound traffic. Outbound traffic is denied entirely because databases do not initiate connections.

Rules are processed by priority number, lowest first. The first matching rule is applied. A rule with priority 100 takes precedence over a rule with priority 200. The default rules at priority 65000 allow VNET internal traffic and load balancer traffic, while priority 65500 denies all other inbound traffic.

### 3.5 Route Tables and UDRs

Route tables define how traffic flows within the VNET and to external destinations. Azure creates default routes: 10.0.0.0/16 routes locally within the VNET, 0.0.0.0/0 routes to the internet, and 10.244.0.0/16 routes to the AKS pod network.

User Defined Routes (UDRs) override default routes. For CloudMart, a UDR forces internet bound traffic from AKS through an Azure Firewall or NAT Gateway rather than direct internet access. This provides a single exit point for audit and security controls.

### 3.6 Private Endpoints

Private endpoints provide private IP addresses for Azure PaaS services, eliminating the need for public internet access. Azure SQL Database, Redis Cache, Service Bus, Key Vault, and Blob Storage each get a private endpoint in the integration subnet.

When AKS connects to SQL Database, the connection flows entirely over the Azure backbone network. The traffic never leaves the Microsoft network. DNS records for the service are overridden to resolve to the private IP address rather than the public endpoint.

Private endpoints have several security benefits: they eliminate exposure to the public internet, they provide fine grained access control through NSG rules, and they enable on premises networks to access Azure services through ExpressRoute or VPN without internet traversal.

### 3.7 VNET Peering and Integration

VNET peering connects two VNETs so resources can communicate using private IPs. Peering can be within the same region (local) or across regions (global). For CloudMart, if we deploy a secondary region for disaster recovery, we use VNET peering between regions for replication traffic.

### 3.8 DevOps Skills Learned

VNET design is a core skill for Azure infrastructure engineers. I am learning network segmentation, subnet design, security group configuration, routing, private endpoints, and network troubleshooting. These skills are heavily tested in AZ 305 and AZ 700 certifications.

---

## 4. Azure Kubernetes Service

### 4.1 AKS Architecture

Azure Kubernetes Service is a managed Kubernetes offering. Azure manages the control plane (master nodes) at no cost. I manage the worker nodes (agent pool) where my application runs. This division of responsibility reduces operational burden significantly.

The control plane includes the API server, etcd, scheduler, controller manager, and cloud controller manager. Azure manages these components, including patching, scaling, and high availability. I never interact with control plane nodes directly.

Worker nodes are Azure VMs that I configure and pay for. These nodes run kubelet, kube proxy, and the container runtime. I choose the VM size, node count, and scaling behavior.

### 4.2 Control Plane

The control plane is free and managed by Azure. It is deployed across multiple availability zones for high availability. The API server endpoint is exposed with a guaranteed SLA of 99.95% when using Availability Zones.

I interact with the control plane through the Kubernetes API, typically via kubectl. The API server validates requests, persists state to etcd, and schedules work to nodes. I never need to manage etcd backups, certificate rotation, or control plane upgrades manually. Azure handles these automatically.

### 4.3 Node Pools and VM Sizes

AKS supports multiple node pools within a single cluster. Each node pool can have different VM sizes, scaling configurations, and taints. CloudMart uses three node pools:

The system node pool runs critical cluster components: ingress controller, cert manager, monitoring agents. It uses Standard_D2s_v3 VMs (2 vCPU, 8 GB RAM) with 2 nodes. Taints prevent application workloads from scheduling here.

The general workload node pool runs application services. It uses Standard_D4s_v3 VMs (4 vCPU, 16 GB RAM) with 3 nodes minimum and 10 nodes maximum through cluster autoscaler.

The spot node pool runs background jobs like analytics aggregation and report generation. It uses spot VMs at up to 90% discount. These VMs can be evicted with 30 seconds notice, so workloads must be fault tolerant.

### 4.4 Networking Models

AKS supports two networking models: Kubenet and Azure CNI. Kubenet is simpler but less flexible. Azure CNI assigns IP addresses from the VNET to pods, providing direct connectivity without NAT overlay.

CloudMart uses Azure CNI because it enables network policies for pod to pod security, private endpoint access from pods without additional routing, and better integration with Azure network services. Azure CNI requires planning sufficient IP address space because each pod receives its own IP.

### 4.5 Storage Integration

AKS integrates with Azure storage through Container Storage Interface drivers. Azure Disk provides block storage for single pod access, suitable for databases. Azure Files provides SMB and NFS file shares for multi pod access, suitable for shared configuration. Azure Blob through CSI provides object storage access.

CloudMart uses Azure Disk for Redis persistence and Azure Files for shared configuration between pods. Most application data persists in Azure SQL Database rather than pod storage.

### 4.6 Identity and Access

AKS supports multiple identity mechanisms. Kubernetes RBAC controls access to Kubernetes resources like pods, services, and config maps. Azure RBAC integrated with Azure AD enables cluster access using corporate credentials. Managed identities allow pods to authenticate to Azure services without credentials.

CloudMart uses managed identities for pod to Azure service authentication. The ingress controller uses a managed identity to read TLS certificates from Key Vault. Application pods use managed identities to connect to SQL Database and Service Bus. No credentials are stored in configuration or code.

### 4.7 Auto Scaling

AKS supports two types of auto scaling. Cluster autoscaler adds or removes nodes based on resource requests that cannot be satisfied. If a pod requires 4 CPU cores and no node has capacity, cluster autoscaler provisions a new node. Horizontal pod autoscaler adjusts replica counts based on CPU utilization, memory usage, or custom metrics. CloudMart configures HPA to scale between 2 and 10 replicas at 70% CPU target.

Vertical pod autoscaler adjusts resource requests and limits based on actual usage. CloudMart does not use VPA because it causes pod restarts. Instead, we right size resource requests through load testing.

### 4.8 Upgrades and Maintenance

AKS supports Kubernetes version upgrades with minimal downtime. The upgrade process creates new nodes with the target version, cordons old nodes to prevent new pod scheduling, drains old nodes to evict running pods, and deletes old nodes. With multiple replicas and pod disruption budgets, applications remain available during upgrades.

CloudMart configures automatic patch upgrades for security patches and plans manual upgrades for minor version changes. Upgrades are tested in staging before applying to production.

### 4.9 DevOps Skills Learned

AKS is the most important Azure service for this project. I am learning cluster architecture, node pool design, networking models, storage integration, identity management, auto scaling, upgrade procedures, and troubleshooting. These skills are essential for any cloud native DevOps role and are heavily tested in AZ 400.

---

## 5. Container Registry

### 5.1 ACR Tiers and Features

Azure Container Registry stores Docker container images. Three tiers are available: Basic for development and learning with limited storage and throughput; Standard for most production workloads with geo replication and content trust; and Premium for high scale workloads with enhanced storage, concurrent operations, and private link support.

CloudMart uses Standard tier for production and Basic tier for development. Premium features would be needed if we had dozens of developers pushing images simultaneously or required private link connectivity.

### 5.2 Repository Management

ACR organizes images into repositories, each corresponding to a service. CloudMart repositories include cloudmart/api gateway, cloudmart/product service, cloudmart/order service, and so on. Each repository contains tagged image versions.

Tagging strategy: git commit SHA for immutable build references, semantic version (v1.2.3) for release identification, and latest for the most recent production deployment. The latest tag is updated only after successful smoke tests in production.

### 5.3 Image Lifecycle

Untagged images and old versions accumulate over time. ACR tasks can automatically purge images older than a specified age or with specific tag patterns. CloudMart configures a retention policy that keeps all tagged images for 30 days, keeps semantically versioned images for 180 days, and deletes untagged images after 7 days.

### 5.4 Geo Replication

Geo replication replicates ACR content to multiple regions. Push to one region automatically replicates to others. This accelerates deployments in multiple regions by pulling images from a local replica rather than across the country.

For CloudMart, when we deploy a secondary region for disaster recovery, we enable geo replication to that region. This ensures images are available even if the primary region is unavailable.

### 5.5 Security and Scanning

ACR integrates with Microsoft Defender for Cloud to scan images for vulnerabilities. Every pushed image is scanned for known CVEs. Critical vulnerabilities block deployment through Azure Policy.

Content trust through Docker Notary ensures that only signed images are deployed to production. This prevents deployment of images built outside the official CI/CD pipeline.

Access control uses Azure RBAC. AKS uses a managed identity with AcrPull role to pull images. Build pipelines use a service principal with AcrPush role to push images. No credentials are embedded in Kubernetes configuration.

### 5.6 Integration with AKS

AKS authenticates to ACR using managed identities. The kubelet on each node uses the cluster's managed identity to authenticate to ACR and pull images. No docker pull secrets are needed in pod specifications. This simplifies deployment and eliminates credential rotation.

### 5.7 DevOps Skills Learned

Container registry management teaches image lifecycle management, vulnerability scanning, geo replication, access control, and CI/CD integration. These skills are essential for container based deployment pipelines.

---

## 6. Azure SQL Database

### 6.1 Architecture and Tiers

Azure SQL Database is a fully managed SQL Server database as a service. Microsoft handles patching, backups, high availability, and monitoring. I only manage the database schema, queries, and performance tuning.

Three service tiers are available: Basic for light workloads with limited performance (5 DTUs), Standard for most production workloads with moderate performance (10-3000 DTUs), and Premium for high performance workloads with fast IO (125-4000 DTUs) and in memory technologies.

CloudMart uses the vCore purchasing model rather than DTU because it provides more transparency into resource allocation. General Purpose tier provides balanced compute and storage for most workloads. Business Critical tier provides higher IO performance and secondary replicas for read scale out.

### 6.2 Purchasing Models

The DTU model bundles compute, memory, and IO into Database Transaction Units. It is simpler but less flexible. The vCore model separates compute from storage, allowing independent scaling. You choose the number of virtual cores and the amount of memory is proportional.

CloudMart uses General Purpose vCore with 2 vCores for development, 4 vCores for staging, and 8 vCores for production. Serverless compute automatically scales based on workload and pauses during inactive periods, ideal for development environments that are only used during business hours.

### 6.3 High Availability

General Purpose tier uses remote storage with a single database engine process. If the VM fails, Azure starts the database engine on a new VM with the same remote storage. RTO is typically under 30 seconds.

Business Critical tier uses a local SSD storage cluster with a primary and up to three secondary replicas. If the primary fails, a secondary is promoted automatically with RTO under 10 seconds and zero data loss. Business Critical also provides read scale out by routing read only queries to secondary replicas.

CloudMart production uses Business Critical tier for the order database because orders require the highest availability and lowest RTO. Other databases use General Purpose tier with geo replication for disaster recovery.

### 6.4 Geo Replication

Active geo replication creates up to 4 readable secondary replicas in other regions. The primary continuously replicates transactions to secondaries. If the primary region fails, failover promotes a secondary to primary.

Auto failover groups provide automated failover with a grace period. If the primary becomes unavailable, the system waits the grace period (default 1 hour) before automatically failing over. This prevents unnecessary failovers during transient outages. During the grace period, manual failover is available.

CloudMart configures auto failover groups with a 5 minute data loss grace period for the order database. In a disaster scenario, we can fail over to East US with at most 5 minutes of data loss.

### 6.5 Backup and Recovery

Azure SQL Database automatically performs full backups weekly, differential backups every 12 hours, and transaction log backups every 5-10 minutes. These backups are stored in geo redundant storage for 7-35 days depending on configuration.

Point in time restore allows recovery to any point within the backup retention period. This is invaluable for recovering from data corruption, accidental deletion, or application bugs. Long term retention can store backups for up to 10 years for compliance.

CloudMart configures 35 day backup retention for production and 7 days for development. Long term retention stores monthly backups for 12 months for compliance.

### 6.6 Security Features

Transparent Data Encryption encrypts data at rest using AES 256. This is enabled by default and cannot be disabled. Advanced Threat Protection monitors for SQL injection, brute force attacks, and unusual access patterns. Private endpoints ensure database connections flow over private network rather than internet. Azure AD authentication eliminates SQL logins and enables passwordless connections using managed identities. Always Encrypted encrypts sensitive columns like phone numbers so that even database administrators cannot read the plaintext.

CloudMart enables all these features. Application connections use managed identities rather than connection strings with passwords. The order database uses Always Encrypted for customer phone numbers.

### 6.7 Performance Optimization

Query Performance Insight identifies the longest running and most resource intensive queries. Automatic tuning can create or drop indexes, force query plans, and adjust database parameters without manual intervention.

CloudMart monitors DTU/vCore utilization, sets alerts for sustained usage above 80%, and reviews Query Performance Insight weekly. Connection pooling through the application reduces connection overhead. Read replicas offload reporting queries from the primary.

### 6.8 DevOps Skills Learned

Azure SQL Database management requires understanding service tiers, purchasing models, high availability, geo replication, backup strategies, security features, and performance optimization. These skills are essential for data platform engineering and are tested in Azure database certifications.

---

## 7. Azure Cache for Redis

### 7.1 Architecture and Tiers

Azure Cache for Redis is a managed Redis offering with four tiers: Basic with a single node and no SLA, Standard with a two node primary/replica and 99.9% SLA, Premium with clustering, persistence, and virtual network support, and Enterprise with Redis modules and active geo replication.

CloudMart uses Premium tier for production because it supports clustering for horizontal scaling, data persistence for recovery, and virtual network injection for security. Development uses Basic tier.

### 7.2 Data Types and Use Cases

Redis supports multiple data types: strings for simple key value caching like product data, hashes for structured objects like user sessions, lists for queues and recent items, sets for unique collections like active user IDs, sorted sets for leaderboards and time series, and bitmaps for boolean flags and analytics.

CloudMart uses strings for product cache with serialized JSON values, hashes for cart storage with field per item, and sets for rate limiting counters.

### 7.3 Persistence Options

Premium tier supports RDB persistence (point in time snapshots) and AOF persistence (append only file with every write). RDB has minimal performance impact but can lose data since the last snapshot. AOF is more durable but has higher performance impact.

CloudMart enables RDB persistence with snapshots every 60 minutes. Cache data is transient and can be rebuilt from the database if lost. Persistence provides faster recovery rather than data durability.

### 7.4 Clustering

Redis Cluster shards data across multiple nodes using hash slots. The Premium tier supports up to 10 shards, each with a primary and replica. Clustering provides horizontal scaling beyond single node memory limits.

CloudMart uses 2 shards in production, providing approximately 12 GB of cache space. Each shard runs in a separate availability zone for fault tolerance.

### 7.5 Security

Premium tier supports virtual network injection, placing the Redis cache in a private subnet with no public endpoint. Private endpoints provide an alternative for standard tier. Redis supports SSL/TLS encryption for data in transit and access keys for authentication.

CloudMart uses virtual network injection with the cache in the DB subnet. Only the AKS subnet can reach the cache through NSG rules. SSL is enforced for all connections.

### 7.6 Performance Tuning

Redis performance is measured in operations per second and latency. Premium tier provides sub millisecond latency for P50 and under 5 milliseconds for P99. Performance scales with shard count.

Key optimization strategies include: compressing values to reduce memory usage, setting appropriate TTLs to prevent unbounded growth, using pipelining to batch multiple operations, avoiding O(N) commands on large collections, and monitoring cache hit rate which should be above 80%.

### 7.7 DevOps Skills Learned

Redis management requires understanding data types, persistence, clustering, security, and performance tuning. These skills apply to any caching layer and are essential for optimizing application performance.

---

## 8. Azure Service Bus

### 8.1 Messaging Patterns

Azure Service Bus is a fully managed enterprise message broker. It supports two messaging patterns: queues for point to point messaging where each message is consumed by exactly one receiver, and topics with subscriptions for publish subscribe messaging where each message is broadcast to multiple subscribers.

CloudMart uses topics for domain events that multiple services consume. For example, an OrderConfirmedEvent is published to the order events topic. The notification subscription receives it to send emails, the analytics subscription receives it to update metrics, and the inventory subscription receives it to commit stock reservations.

### 8.2 Queues vs Topics

Queues are appropriate for work distribution: background jobs, order processing pipelines, and email sending. Multiple consumers can read from the same queue with Service Bus handling load balancing. Each message is processed exactly once.

Topics are appropriate for event broadcasting: domain events, state change notifications, and fan out patterns. Each subscription maintains its own cursor, allowing independent consumption rates.

CloudMart uses queues for scheduled report generation and bulk email campaigns where work is distributed across multiple processor instances.

### 8.3 Subscriptions and Filters

Topic subscriptions can have filters that determine which messages the subscription receives. SQL filters evaluate message properties using SQL like syntax. Correlation filters match on specific property values efficiently.

CloudMart uses correlation filters to route events efficiently. The analytics subscription filters for OrderConfirmedEvent and PaymentProcessedEvent, ignoring other event types. This reduces message processing overhead.

### 8.4 Dead Letter Handling

Messages that cannot be processed after maximum delivery attempts are moved to a dead letter queue. Each queue and subscription has its own dead letter queue. Common causes include poison messages that crash the consumer, messages with invalid schemas, and processing failures due to downstream service unavailability.

CloudMart configures max delivery attempts of 10. The dead letter queue is monitored with alerts triggering when messages accumulate. A separate process analyzes dead letter messages, logs the failure reason, and either replays fixable messages or archives permanently failed ones.

### 8.5 Sessions and Ordering

Service Bus sessions ensure ordered message delivery. Messages with the same session ID are delivered to the same consumer in order. This is useful when processing must maintain sequence, such as order status updates for the same order.

CloudMart uses sessions for order events to ensure that status updates for a given order are processed sequentially. Events for different orders can be processed in parallel.

### 8.6 Geo Disaster Recovery

Service Bus supports geo disaster recovery by pairing a primary namespace with a secondary in another region. The alias DNS record points to the primary. During failover, the alias switches to the secondary. Messages are replicated asynchronously.

CloudMart configures geo disaster recovery for the production Service Bus namespace. In a regional disaster, the secondary namespace in East US would be activated.

### 8.7 DevOps Skills Learned

Service Bus management requires understanding messaging patterns, queue design, topic subscriptions, filtering, dead letter handling, sessions, and disaster recovery. These skills apply to any event driven architecture and are essential for distributed systems.

---

## 9. Application Gateway

### 9.1 Architecture and Components

Azure Application Gateway is a Layer 7 load balancer with web application firewall capabilities. It operates at the HTTP/HTTPS level, enabling routing based on URL path, host header, and query parameters. Unlike Layer 4 load balancers that route based on IP and port, Application Gateway can route /api requests to the API cluster and /static requests to blob storage.

Components include: the gateway itself which processes requests and responses, listeners that wait for requests on specific ports and protocols, backend pools that define target server groups, routing rules that map listeners to backend pools based on conditions, health probes that monitor backend health, and the web application firewall that inspects traffic for threats.

### 9.2 WAF Policies

The Web Application Firewall protects against common attacks defined by OWASP: SQL injection, cross site scripting, remote file inclusion, and other top 10 threats. WAF operates in detection mode (logs threats without blocking) or prevention mode (blocks threats).

CloudMart runs WAF in prevention mode with OWASP 3.2 core rule set. Custom rules block known malicious IPs and restrict request sizes. False positives are tuned by excluding specific rules for legitimate traffic patterns.

### 9.3 SSL and Certificates

Application Gateway terminates SSL connections from clients. Certificates are stored in the gateway configuration. For backend communication, the gateway can use HTTP (for internal trusted networks) or HTTPS with backend certificates.

CloudMart uses certificates stored in Azure Key Vault. The gateway references Key Vault for certificate retrieval, enabling automatic renewal when certificates are updated. Frontend connections require TLS 1.2 or higher. Weak ciphers are disabled.

### 9.4 Routing Rules

Path based routing sends different URL paths to different backends: /api routes to the AKS ingress, /static routes to blob storage, and / routes to the customer SPA. Host based routing routes different domains: api.cloudmart.com routes to the API, admin.cloudmart.com routes to the admin SPA, and www.cloudmart.com routes to the customer SPA.

CloudMart uses path based routing with a single domain. This simplifies SSL certificate management and reduces DNS configuration.

### 9.5 Health Probes

Health probes periodically check backend health by sending HTTP requests to a configured path. Unhealthy backends are removed from rotation. When they recover, they are added back automatically.

CloudMart configures probes to the /health/ready endpoint on the ingress controller with a 30 second interval and 2 unhealthy threshold. This ensures failed pods are detected within 60 seconds.

### 9.6 Scaling and Performance

Application Gateway supports autoscaling from 0 to 125 capacity units. Each capacity unit provides approximately 10 Mbps throughput. For high availability, a minimum of 2 instances is recommended.

CloudMart configures autoscaling with 2 minimum instances and 10 capacity units maximum. This handles normal traffic with headroom for spikes.

### 9.7 DevOps Skills Learned

Application Gateway management requires understanding Layer 7 load balancing, WAF configuration, SSL termination, routing rules, health probes, and autoscaling. These skills are essential for edge network design and are tested in networking certifications.

---

## 10. Azure Key Vault

### 10.1 Vault Architecture

Azure Key Vault is a cloud service for securely storing and accessing secrets, encryption keys, and certificates. Key Vault uses hardware security modules to protect cryptographic operations. Keys never leave the HSM boundary in the Premium tier.

A vault is the top level resource. Within a vault, you create keys, secrets, and certificates. Access is controlled through access policies or Azure RBAC.

### 10.2 Secret Management

Secrets are name value pairs with optional content type and activation/expiration dates. Secret values are encrypted at rest using AES 256 and in transit using TLS. Key Vault automatically rotates secrets when integrated with supported services.

CloudMart stores database connection strings, Redis connection strings, Service Bus connection strings, Stripe API keys, SendGrid API keys, and Twilio API keys in Key Vault. Application pods use managed identities to read secrets at runtime. No secrets are stored in configuration files or environment variables.

### 10.3 Key Management

Keys in Key Vault support encryption, decryption, signing, and verification operations. Applications can reference keys by name and let Key Vault perform the operations, or export public keys for local use while keeping private keys in the vault.

CloudMart uses Key Vault keys for encrypting sensitive database columns through Always Encrypted. The application sends plaintext to Key Vault which returns ciphertext for storage. Decryption reverses the process.

### 10.4 Certificate Management

Key Vault can store certificates, automatically renew certificates from integrated certificate authorities, and generate self signed certificates for testing. Certificates are composed of a private key, public certificate, and intermediate certificates.

CloudMart stores the SSL certificate for Application Gateway in Key Vault. Azure Key Vault can integrate with Let's Encrypt for automatic certificate renewal, or with enterprise CAs for organization issued certificates.

### 10.5 Access Policies and RBAC

Access policies control what operations principals can perform on vault contents. Separate permissions exist for keys, secrets, and certificates. Azure RBAC provides more granular control with built in roles like Key Vault Secrets Officer and Key Vault Reader.

CloudMart uses Azure RBAC. AKS managed identities have Key Vault Secrets User role on the production vault, allowing read access to secrets only. CI/CD service principals have Key Vault Secrets Officer for updating secrets during rotation.

### 10.6 Integration with AKS

The Azure Key Vault Provider for Secrets Store CSI Driver mounts secrets as files in pod volumes. Pods read secrets from files rather than environment variables. Secret updates are automatically reflected in pods without restarts when configured with rotation polling.

CloudMart mounts database connection strings as files at /mnt/secrets/sql connection string. The application reads the file at startup. If the secret is rotated, the file updates and the application picks up the new value on next restart.

### 10.7 DevOps Skills Learned

Key Vault management is critical for cloud security. I am learning secret lifecycle management, key management, certificate management, access control, and service integration. These skills are essential for security engineering and compliance.

---

## 11. Azure Monitor and Log Analytics

### 11.1 Metrics Platform

Azure Monitor collects metrics from Azure resources, applications, and operating systems. Metrics are numerical values at a point in time, stored in a time series database with 93 days retention (free) and up to 2 years (paid).

Every Azure resource emits platform metrics automatically: CPU percentage, memory usage, disk operations, network throughput. Applications can emit custom metrics through the Application Insights SDK or the OpenTelemetry exporter.

CloudMart emits custom metrics for business KPIs: orders per hour, average order value, and cart abandonment rate. These metrics appear alongside infrastructure metrics in dashboards and alerts.

### 11.2 Log Analytics Workspace

Log Analytics is the central log store for Azure Monitor. It collects logs from Azure resources, applications, and agents, storing them in a workspace with configurable retention. Queries use Kusto Query Language, a powerful SQL like language optimized for log analysis.

CloudMart configures a single Log Analytics workspace for production with 30 day retention. All AKS pod logs, Azure SQL audit logs, and application structured logs flow into this workspace. KQL queries power dashboards, alerts, and ad hoc investigation.

### 11.3 Application Insights

Application Insights is an application performance management service integrated with Azure Monitor. It automatically collects request telemetry, dependency calls, exceptions, and performance counters. Custom events and metrics can be added through the SDK.

Key features include: distributed tracing following requests across services, smart detection that automatically identifies anomalies and performance regressions, availability tests that probe endpoints from multiple locations, and usage analytics showing user sessions, page views, and funnels.

CloudMart enables Application Insights on all services with sampling set to 10% for high traffic services to control cost. Custom events track business actions like checkout completion and promotion usage.

### 11.4 Alert Rules

Alert rules evaluate metrics or log queries against thresholds at regular intervals. When triggered, they fire actions: send email, post to Slack, create an incident in ITSM, or trigger an Azure Function.

CloudMart configures metric alerts for: CPU above 80% for 5 minutes, memory above 85% for 5 minutes, request latency P95 above 500ms for 10 minutes, error rate above 1% for 5 minutes, and database DTU above 80% for 10 minutes.

Log alerts monitor: exception count above 10 per 5 minutes, failed authentication count above 50 per 5 minutes, and payment failure rate above 10% per 15 minutes.

Action groups define who gets notified and how. Severity levels (0-4) determine urgency. P1 alerts page the on call engineer through PagerDuty. P2 alerts post to Slack. P3 alerts send email.

### 11.5 Dashboards and Workbooks

Azure Dashboards provide at a glance views of resource health with customizable tiles. Workbooks provide interactive reports with parameters, charts, and grids. Dashboards are for monitoring; workbooks are for investigation.

CloudMart creates a main dashboard showing service health, request rates, error rates, and business metrics. Separate workbooks exist for incident investigation, performance analysis, and cost review.

### 11.6 DevOps Skills Learned

Azure Monitor is the operational backbone of cloud platforms. I am learning metrics collection, log aggregation, KQL query writing, alert configuration, dashboard design, and APM integration. These skills are fundamental for SRE and DevOps roles.

---

## 12. Azure Blob Storage

### 12.1 Storage Tiers

Azure Blob Storage offers four access tiers: Hot for frequently accessed data with the highest storage cost but lowest access cost, Cool for infrequently accessed data with lower storage cost but higher access cost and 30 day minimum retention, Archive for rarely accessed data with the lowest storage cost but highest access cost and 180 day minimum retention, and Premium for high performance block blobs using SSD storage.

CloudMart uses Hot tier for product images actively served through CDN, Cool tier for order documents older than 90 days, and Archive tier for analytics raw data older than 1 year.

### 12.2 Blob Types

Block blobs store text and binary data up to approximately 4.75 TB. They are the default and most commonly used type. Append blobs are optimized for append operations like logging. Page blobs store random access files up to 8 TB, used for VM disks.

CloudMart uses block blobs for all storage needs: product images, user uploads, and analytics data.

### 12.3 Lifecycle Management

Lifecycle management policies automatically transition blobs between tiers or delete them based on age. Rules can filter by blob prefix or blob index tags.

CloudMart configures a lifecycle policy: product images stay in Hot tier permanently, order PDFs move to Cool after 90 days, analytics raw data moves to Archive after 30 days, and temporary export files are deleted after 7 days.

### 12.4 Security and Access Control

Access to blob storage is controlled through: Azure RBAC for management operations, shared access signatures for time limited delegated access, and stored access policies for revocable SAS tokens.

CloudMart uses private endpoints for all storage access. Product images served through CDN use SAS tokens with read only permission and 1 hour expiry. No storage account keys are distributed to clients.

### 12.5 CDN Integration

Azure CDN integrates with Blob Storage to cache content at edge locations globally. The CDN pulls content from the origin blob storage on first request and serves subsequent requests from the edge cache.

CloudMart serves all product images and static web assets through Azure CDN. Cache expiration is set to 24 hours for images that rarely change and 1 hour for JavaScript/CSS files that change with deployments.

### 12.6 DevOps Skills Learned

Blob Storage management requires understanding storage tiers, blob types, lifecycle policies, access control, and CDN integration. These skills are essential for content storage and delivery.

---

## 13. Azure AI Search

### 13.1 Index Architecture

Azure AI Search is a managed search service that indexes content and provides rich query capabilities. An index defines the structure of searchable data with fields, data types, and analyzers. Fields can be searchable (full text search), filterable (exact match filtering), sortable (ordering), facetable (aggregation), and retrievable (returned in results).

The CloudMart product index defines fields: ProductId (searchable, filterable, retrievable), Name (searchable, retrievable), Description (searchable, retrievable), CategoryId (filterable, facetable), Price (filterable, sortable, facetable), Rating (filterable, sortable, facetable), Tags (searchable, filterable), and Brand (filterable, facetable).

### 13.2 Document Processing

Documents are added to the index through push (API calls) or pull (indexers that connect to data sources). Indexers can connect to Azure SQL, Cosmos DB, Blob Storage, and other sources, automatically detecting changes and updating the index.

CloudMart uses push indexing because product data changes through the Product Service API. When a product is created or updated, the service pushes the document to the search index. This provides immediate searchability rather than waiting for indexer schedules.

### 13.3 Query Capabilities

Azure AI Search supports: simple query syntax for basic search terms, full Lucene syntax for wildcards, fuzzy matching, and proximity searches, filters using OData expressions for exact matching and ranges, facets for aggregation and navigation, autocomplete for query suggestions, and semantic search for intent based ranking using AI models.

CloudMart uses full text search with filtering and faceting for product browsing. Autocomplete powers the search suggestion dropdown. Semantic search improves relevance for natural language queries like "comfortable running shoes for flat feet."

### 13.4 Scoring and Ranking

Search results are ranked by relevance score calculated from term frequency, field weights, and proximity. Scoring profiles allow custom ranking that boosts results based on business rules: boost newer products, boost higher rated products, and boost products with more reviews.

CloudMart configures a scoring profile that combines text relevance with business metrics. Highly rated, popular products appear higher for ambiguous queries.

### 13.5 Scaling

Search service capacity is measured in search units. Basic tier provides 3 replicas and 1 partition. Standard tiers allow scaling replicas for query throughput and partitions for index size.

CloudMart uses Standard S1 tier with 2 replicas and 1 partition in production. Replicas provide query high availability and throughput. If a replica fails, queries route to the remaining replica.

### 13.6 DevOps Skills Learned

Search service management requires understanding index design, document processing, query syntax, relevance tuning, and scaling. These skills apply to any application with search functionality.

---

## 14. Azure Active Directory B2C

### 14.1 Tenant Architecture

Azure AD B2C is a customer identity and access management service. It provides a separate tenant from your organization's Azure AD, dedicated to customer identities. Customer accounts are independent of employee accounts, preventing accidental access to internal resources.

The B2C tenant contains: user accounts with profile attributes, identity providers for social login integration, user flows for authentication experiences, and custom policies for advanced scenarios.

### 14.2 User Flows

User flows are pre built authentication experiences: sign up and sign in, profile editing, and password reset. Each flow generates a URL that redirects users to B2C hosted pages. Users authenticate and are redirected back to the application with tokens.

CloudMart uses a combined sign up/sign in flow with email and password. The flow collects email, password, first name, and last name during registration. It enforces password complexity and email verification.

### 14.3 Custom Policies

Custom policies provide advanced customization beyond user flows. They use XML configuration to define the exact authentication journey: which identity providers to offer, what claims to collect, what validation to perform, what external APIs to call, and what tokens to issue.

CloudMart starts with user flows and can migrate to custom policies if advanced scenarios like progressive profiling, step up authentication, or custom fraud detection are needed.

### 14.4 Identity Providers

B2C supports multiple identity providers: local accounts with email/password, social providers like Google, Facebook, Apple, Microsoft, and enterprise providers like SAML and OIDC.

CloudMart initially supports local accounts only. Social login providers are planned for future phases to reduce friction during registration.

### 14.5 Token Configuration

B2C issues JSON Web Tokens with configurable claims. Access tokens contain the user ID, email, and application roles. Token lifetime is configurable: access tokens valid for 15 minutes and refresh tokens valid for 7 days with sliding expiration.

CloudMart configures tokens to include the B2C object ID as the subject claim, email as a claim, and a custom claim indicating whether email is verified. Application roles are managed separately in the Auth Service.

### 14.6 DevOps Skills Learned

Azure AD B2C management requires understanding identity management, authentication flows, token configuration, and user experience customization. These skills are essential for customer facing applications.

---

## 15. Managed Identities

### 15.1 System Assigned vs User Assigned

System assigned managed identities are tied to a specific Azure resource. When the resource is deleted, the identity is automatically deleted. They are suitable for single resource scenarios like an AKS cluster accessing Key Vault.

User assigned managed identities are standalone resources that can be assigned to multiple Azure resources. They persist independently and are suitable for scenarios where multiple resources share the same identity.

CloudMart uses system assigned managed identities for AKS clusters and user assigned managed identities shared across development environment resources.

### 15.2 How They Work

Managed identities use Azure AD service principals behind the scenes. Azure automatically manages credentials: creating the service principal, rotating certificates, and providing tokens. Applications request tokens from the Azure Instance Metadata Service endpoint, available only from within Azure. No credentials are stored in code or configuration.

When an application requests a token, it sends an HTTP GET to the IMDS endpoint with the resource URI it wants to access. Azure validates the identity, checks RBAC permissions, and returns an access token valid for that resource. The application uses this token in the Authorization header.

### 15.3 Supported Services

Most Azure services support managed identities: AKS for pod identity, Azure SQL for database access, Service Bus for messaging, Key Vault for secret retrieval, Blob Storage for file access, and more.

CloudMart uses managed identities for all Azure service access, eliminating connection strings with embedded credentials from all application configurations.

### 15.4 Security Benefits

Managed identities eliminate credential management: no passwords or connection strings to store, rotate, or leak. Credentials are rotated automatically by Azure. Access is controlled through Azure RBAC with audit logging. No credentials exist that can be stolen from source code, configuration files, or developer workstations.

### 15.5 DevOps Skills Learned

Managed identity management is a critical security skill. I am learning identity configuration, RBAC assignment, token acquisition patterns, and security architecture without credentials.

---

## 16. Load Balancing and Traffic Management

### 16.1 Azure Load Balancer

Azure Load Balancer operates at Layer 4, distributing TCP and UDP traffic across backend instances. It supports public (internet facing) and internal (private network) configurations. Health probes determine which backends receive traffic.

Load Balancer is suitable for scenarios requiring high throughput, low latency, and any protocol. It is used for AKS ingress in some configurations and for VM scale sets.

### 16.2 Traffic Manager

Traffic Manager is a DNS based traffic load balancer. It routes clients to the closest or healthiest endpoint based on DNS resolution. Routing methods include priority (active passive failover), weighted (load distribution), performance (closest endpoint), and geographic (region based).

CloudMart uses priority routing for disaster recovery. The primary region (West US 2) has priority 1. The secondary region (East US) has priority 2. If health checks fail for the primary, Traffic Manager resolves DNS to the secondary.

### 16.3 Front Door

Azure Front Door is a global, scalable entry point using the Microsoft edge network. It provides global load balancing, SSL offloading, WAF, URL rewriting, and caching. Unlike Traffic Manager which operates at DNS level, Front Door proxies traffic through edge locations.

Front Door is suitable for global applications requiring the lowest latency through anycast routing. CloudMart does not use Front Door initially but would adopt it when expanding globally.

### 16.4 Choosing Between Them

For TCP/UDP traffic without HTTP inspection, use Load Balancer. For HTTP/HTTPS traffic with path routing and WAF, use Application Gateway. For DNS based global failover, use Traffic Manager. For global HTTP/HTTPS with edge caching and lowest latency, use Front Door. These services can be combined: Traffic Manager for global failover between Application Gateways in different regions.

### 16.5 DevOps Skills Learned

Load balancing design requires understanding traffic patterns, routing methods, health checking, and global distribution. These skills are essential for resilient architecture.

---

## 17. Azure DNS

### 17.1 DNS Zones

Azure DNS hosts DNS domains and manages record sets. It provides the same uptime guarantees as other Azure services (99.99%) and integrates with Azure resources through alias records.

CloudMart hosts the cloudmart.com zone in Azure DNS. This enables automated record management through Terraform and integration with Traffic Manager and Application Gateway.

### 17.2 Record Types

Azure DNS supports A (IPv4 address), AAAA (IPv6 address), CNAME (canonical name), MX (mail exchange), NS (name server), PTR (pointer), SOA (start of authority), SRV (service), and TXT (text) records.

### 17.3 Alias Records

Alias records map directly to Azure resources rather than IP addresses or hostnames. An A record alias can point to a Traffic Manager profile, Application Gateway, or CDN endpoint. When the resource IP changes, the alias automatically updates.

CloudMart uses alias records for www.cloudmart.com pointing to the Traffic Manager profile, and api.cloudmart.com pointing to the Application Gateway frontend.

### 17.4 Private DNS

Azure Private DNS provides name resolution within virtual networks. Private DNS zones resolve names to private IP addresses for resources with private endpoints.

CloudMart uses Private DNS for the Azure SQL private endpoint. The hostname cloudmart-sql.database.windows.net resolves to the private IP 10.0.2.4 within the VNET rather than the public IP.

### 17.5 DevOps Skills Learned

DNS management requires understanding record types, alias integration, private resolution, and automation. These skills are essential for any internet facing application.

---

## 18. Cost Management

### 18.1 Pricing Models

Azure uses consumption based pricing: you pay for what you use. Different services have different pricing dimensions: compute is priced per hour of VM usage, storage is priced per GB per month with transaction fees, networking is priced per GB of data transfer, and managed services often charge per unit of throughput or operations.

Understanding pricing dimensions is essential for cost estimation and optimization. Azure Pricing Calculator estimates monthly costs based on expected usage.

### 18.2 Cost Optimization

Right sizing selects the appropriate service tier and capacity for actual workload. An oversized SQL database or overprovisioned Kubernetes cluster wastes money. Monitoring actual utilization and adjusting prevents overprovisioning.

Reserved Instances commit to 1 or 3 year usage in exchange for up to 72% discount. Suitable for predictable baseline capacity. CloudMart evaluates reserved instances for production AKS nodes after establishing steady state usage.

Spot instances use excess Azure capacity at up to 90% discount. Suitable for fault tolerant background workloads. CloudMart uses spot instances for the analytics batch job node pool.

Auto scaling ensures resources match demand, scaling down during quiet periods. CloudMart enables cluster autoscaler and HPA to minimize idle capacity.

Storage tiering moves infrequently accessed data to cheaper tiers. Lifecycle management policies automate this transition.

### 18.3 Budgets and Alerts

Azure Cost Management allows setting budgets with alerts at percentage thresholds. When spending exceeds 50%, 75%, and 90% of budget, notifications are sent.

CloudMart configures a monthly budget of $100 for development (the free credit amount), $200 for staging, and $500 for production. Alerts trigger at 50%, 75%, and 90% thresholds. The 90% alert triggers a manual review to prevent overruns.

### 18.4 Reserved Instances

Reserved instances require committing to 1 or 3 years of usage for specific VM sizes in specific regions. The savings are significant: up to 72% for 3 year commitments on certain VM families.

CloudMart evaluates reserved capacity for production AKS nodes after 3 months of steady state operation. Reserved instances are purchased only when usage patterns are well understood.

### 18.5 DevOps Skills Learned

Cost management is an essential FinOps skill. I am learning pricing models, optimization strategies, budgeting, reserved instance planning, and cost monitoring. These skills demonstrate business acumen alongside technical capability.

---

## What I Have Accomplished in This Volume

This volume provided exhaustive documentation for every Azure service in the CloudMart platform. I covered Azure fundamentals including platform architecture, regions, and resource organization; Resource Groups with lifecycle management and tagging strategies; Virtual Networks with subnet design, NSGs, routing, and private endpoints; Azure Kubernetes Service with control plane architecture, node pools, networking, storage, identity, scaling, and upgrades; Container Registry with tiers, image management, and security; Azure SQL Database with service tiers, purchasing models, high availability, geo replication, backups, security, and performance; Azure Cache for Redis with architecture, data types, persistence, clustering, and tuning; Azure Service Bus with messaging patterns, queues, topics, filters, dead letter handling, and disaster recovery; Application Gateway with architecture, WAF, SSL, routing, and scaling; Azure Key Vault with secrets, keys, certificates, and AKS integration; Azure Monitor with metrics, logs, alerts, and dashboards; Azure Blob Storage with tiers, lifecycle management, and CDN; Azure AI Search with indexing, querying, and scaling; Azure AD B2C with user flows and token configuration; Managed Identities with system vs user assigned and security benefits; Load Balancing with Traffic Manager and Front Door; Azure DNS with zones, records, and private resolution; and Cost Management with optimization strategies and budgeting.

**DevOps skills learned in this volume:** Comprehensive Azure service knowledge, network architecture design, managed Kubernetes operations, database administration, message broker management, secrets management, monitoring design, and cloud cost optimization.

**Interview questions this prepares me for:** Design a virtual network for a multi tier application. How do you secure database access in Azure? What AKS networking model would you choose and why? How do you implement disaster recovery for SQL Database? What is the difference between Traffic Manager and Front Door? How do you manage secrets in a Kubernetes environment? How do you optimize Azure costs?

**Real world engineering problem this solves:** Enterprise applications require deep Azure expertise. This volume documents the knowledge needed to design, deploy, and operate production Azure infrastructure. It serves as both a learning guide and a reference for daily operations.

**Azure services being mastered:** Resource Groups, VNET, AKS, ACR, Azure SQL, Redis, Service Bus, Application Gateway, Key Vault, Monitor, Log Analytics, Blob Storage, AI Search, AD B2C, Traffic Manager, Azure DNS, and Managed Identities.

**DevOps concepts being mastered:** Cloud infrastructure design, network security, container orchestration, managed databases, event driven messaging, secrets management, observability, and FinOps.

---

End of Volume 4