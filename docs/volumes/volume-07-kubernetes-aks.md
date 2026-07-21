# Volume 7: Kubernetes on Azure Kubernetes Service

## The Purpose of This Volume

This volume provides exhaustive documentation for deploying and operating the CloudMart platform on Azure Kubernetes Service. Kubernetes is the most important technology in modern cloud native infrastructure. It is the platform upon which all CloudMart services run. Understanding Kubernetes deeply is not optional for a DevOps engineer. It is the defining skill of the role.

Kubernetes is complex because it solves complex problems: deploying hundreds of containers across dozens of servers, keeping them healthy, scaling them under load, routing traffic between them, managing their configuration and secrets, and updating them without downtime. This volume explains every concept needed to operate a production Kubernetes cluster.

---

## Detailed Table of Contents

1. Kubernetes Fundamentals
   1.1 What Kubernetes Is and Why It Exists
   1.2 The Problem of Container Orchestration
   1.3 Kubernetes Architecture Overview
   1.4 Kubernetes History and Ecosystem
   1.5 DevOps Skills Learned

2. AKS Cluster Architecture
   2.1 Control Plane Deep Dive
   2.2 Node Architecture
   2.3 Node Pool Design
   2.4 Networking Integration
   2.5 DevOps Skills Learned

3. Pods
   3.1 Pod Concept and Lifecycle
   3.2 Pod Specification
   3.3 Init Containers
   3.4 Sidecar Pattern
   3.5 Pod Security
   3.6 DevOps Skills Learned

4. Deployments
   4.1 Deployment Purpose
   4.2 ReplicaSets
   4.3 Rolling Updates
   4.4 Rollback
   4.5 Deployment Strategies
   4.6 DevOps Skills Learned

5. Services
   5.1 Service Types
   5.2 ClusterIP
   5.3 LoadBalancer
   5.4 Service Discovery
   5.5 Headless Services
   5.6 DevOps Skills Learned

6. Ingress
   6.1 Ingress Concept
   6.2 Ingress Controller
   6.3 TLS Configuration
   6.4 Path and Host Routing
   6.5 Rate Limiting and Annotations
   6.6 DevOps Skills Learned

7. ConfigMaps and Secrets
   7.1 ConfigMaps for Configuration
   7.2 Secrets for Sensitive Data
   7.3 Mounting as Files
   7.4 Environment Variables
   7.5 External Secrets with Key Vault
   7.6 DevOps Skills Learned

8. Persistent Volumes
   8.1 Storage Concepts
   8.2 Azure Disk CSI Driver
   8.3 Azure Files CSI Driver
   8.4 Storage Classes
   8.5 Volume Claims
   8.6 DevOps Skills Learned

9. Autoscaling
   9.1 Horizontal Pod Autoscaler
   9.2 Cluster Autoscaler
   9.3 Vertical Pod Autoscaler
   9.4 KEDA for Event Driven Scaling
   9.5 Scaling Policies
   9.6 DevOps Skills Learned

10. Scheduling
    10.1 How Scheduling Works
    10.2 Taints and Tolerations
    10.3 Node Affinity
    10.4 Pod Affinity and Anti Affinity
    10.5 Resource Requests and Limits
    10.6 DevOps Skills Learned

11. Networking
    11.1 CNI Plugins
    11.2 Azure CNI
    11.3 Network Policies
    11.4 Service Mesh Introduction
    11.5 DNS in Kubernetes
    11.6 DevOps Skills Learned

12. RBAC and Security
    12.1 Service Accounts
    12.2 Roles and ClusterRoles
    12.3 RoleBindings
    12.4 Pod Security Standards
    12.5 Network Policies
    12.6 DevOps Skills Learned

13. Helm Package Management
    13.1 Helm Concepts
    13.2 Chart Structure
    13.3 Values Files
    13.4 Template Functions
    13.5 Chart Dependencies
    13.6 DevOps Skills Learned

14. Observability
    14.1 Health Checks
    14.2 Metrics with Prometheus
    14.3 Logging Patterns
    14.4 Tracing
    14.5 DevOps Skills Learned

15. Troubleshooting
    15.1 Common Issues
    15.2 Debugging Commands
    15.3 Log Analysis
    15.4 Network Debugging
    15.5 DevOps Skills Learned

---

## 1. Kubernetes Fundamentals

### 1.1 What Kubernetes Is and Why It Exists

Kubernetes, often abbreviated as K8s, is an open source container orchestration platform originally developed by Google and now maintained by the Cloud Native Computing Foundation. The name comes from Greek, meaning "helmsman" or "pilot," which reflects its role in steering containerized applications.

Google ran containers at scale for years before Kubernetes existed, using internal systems called Borg and Omega. When Docker made containers accessible to everyone, the need for an open, portable orchestration system became clear. Kubernetes was Google's response: the lessons from a decade of container orchestration, made available to everyone.

Kubernetes exists because manually managing containers at scale is impossible. Imagine you have 50 microservices, each running 3 replicas, spread across 20 servers. Manually deciding where each container runs, restarting failed containers, routing traffic, scaling based on load, and updating without downtime requires automation. Kubernetes provides that automation.

### 1.2 The Problem of Container Orchestration

Container orchestration solves specific problems: deployment automation (deploying containers to the right servers), health management (detecting and replacing failed containers), scaling (adding or removing containers based on demand), service discovery (finding other services without hardcoded IP addresses), load balancing (distributing traffic across healthy containers), storage orchestration (attaching persistent storage), configuration management (managing configuration and secrets), and rolling updates (updating without downtime).

Without orchestration, you would need custom scripts, manual intervention, and constant monitoring. With Kubernetes, you declare the desired state and the system makes it so.

### 1.3 Kubernetes Architecture Overview

Kubernetes has a control plane and worker nodes. The control plane makes global decisions: scheduling containers, responding to failures, and exposing the API. Worker nodes run the actual containers.

The control plane components are: API Server (the front end for the Kubernetes API, all communication goes through it), etcd (the distributed key value store that holds all cluster state), Scheduler (assigns pods to nodes based on resource requirements and constraints), Controller Manager (runs controllers that regulate cluster state), and Cloud Controller Manager (integrates with Azure for load balancers, persistent volumes, and node management).

Worker node components are: kubelet (the agent that runs on each node, ensuring containers are running as specified), kube proxy (network proxy that maintains network rules for service communication), and container runtime (containerd, which actually runs the containers).

With AKS, Azure manages the control plane. I only manage the worker nodes and the workloads running on them.

### 1.4 Kubernetes History and Ecosystem

Kubernetes was open sourced by Google in 2014. The Cloud Native Computing Foundation was formed to govern it. The ecosystem includes: Helm for package management, Prometheus for monitoring, Grafana for visualization, Fluentd/Fluent Bit for log aggregation, Istio for service mesh, cert-manager for certificate management, and many more.

This ecosystem is both a strength and a challenge. The integration between tools enables powerful capabilities. But the learning curve is steep, and choosing the right tools requires experience.

### 1.5 DevOps Skills Learned

Kubernetes fundamentals teach me the core concepts of container orchestration: the declarative model, control plane architecture, and the separation of concerns between control plane and workers. These concepts apply to any Kubernetes distribution, not just AKS.

---

## 2. AKS Cluster Architecture

### 2.1 Control Plane Deep Dive

In AKS, the control plane is managed by Azure at no cost. It runs across multiple availability zones for high availability. The API server endpoint is exposed with a guaranteed SLA of 99.95% with Availability Zones and 99.9% without.

The control plane scales automatically based on cluster size. As you add more nodes and pods, Azure scales the etcd and API server capacity. You do not configure or manage any control plane components directly.

Access to the API server is authenticated through Azure AD integration or local accounts. CloudMart uses Azure AD integration for production clusters, enabling role based access through Azure AD groups.

### 2.2 Node Architecture

AKS worker nodes are Azure virtual machines running a specialized OS image (Ubuntu or Azure Linux) with Kubernetes components preinstalled. Each node runs: kubelet (communicating with the API server and managing containers), kube proxy (handling service networking), containerd (the container runtime), and Azure specific agents (for monitoring and log collection).

Node sizing impacts the number of pods that can run per node. Each node has a pod limit based on VM size. A Standard_D4s_v3 supports up to 110 pods. In practice, you should limit pods per node to 30-50 for stability, leaving headroom for system pods and spikes.

### 2.3 Node Pool Design

AKS supports multiple node pools with different configurations. CloudMart uses three node pools:

System node pool: hosts critical cluster infrastructure. Uses Standard_D2s_v3 VMs. Has the CriticalAddonsOnly taint to prevent application pods from scheduling. Runs 2 nodes across availability zones.

General node pool: hosts application workloads. Uses Standard_D4s_v3 VMs. Enable cluster autoscaler with 3-10 nodes. No taints, so any application pod can schedule here.

Spot node pool: hosts fault tolerant background jobs. Uses spot VM instances at up to 90% discount. Tolerates evictions. Runs analytics aggregation and report generation jobs.

### 2.4 Networking Integration

CloudMart uses Azure CNI with network policy (Calico). Each pod gets an IP address from the VNET subnet. Pod IP addresses are routable within the VNET and across peered VNETs. Network policies enforce which pods can communicate with each other.

The service CIDR (10.245.0.0/16) is used for cluster internal services. The DNS service IP is 10.245.0.10. Pods use this DNS server to resolve service names.

### 2.5 DevOps Skills Learned

AKS cluster architecture teaches me node pool design, VM sizing, pod density planning, and networking integration with Azure VNETs. These skills are essential for cluster design and capacity planning.

---

## 3. Pods

### 3.1 Pod Concept and Lifecycle

A pod is the smallest deployable unit in Kubernetes. A pod encapsulates one or more containers that share storage, network, and a specification for how to run. Containers in the same pod can communicate through localhost and share volumes.

Most CloudMart pods contain a single container (the application). Some pods use the sidecar pattern with additional containers for logging, monitoring, or proxying.

The pod lifecycle: Pending (scheduled but containers not running), Running (at least one container is running), Succeeded (all containers exited successfully, used for jobs), Failed (all containers exited with at least one failure), and Unknown (state cannot be determined).

### 3.2 Pod Specification

A pod spec defines: containers with their images, ports, environment variables, and resource requests/limits; volumes for shared storage; restart policy; and DNS settings.

CloudMart pod specs include: the application container with resource requests and limits, a security context running as non root user, environment variables for configuration, volume mounts for secrets from Key Vault, and health check probes.

### 3.3 Init Containers

Init containers run before the main application container starts. They must complete successfully before the application container begins. Common uses: waiting for dependencies to be ready, running database migrations, and generating configuration files.

CloudMart uses init containers for database migrations. Before the application starts, an init container runs Entity Framework migrations to ensure the database schema is up to date.

### 3.4 Sidecar Pattern

Sidecars are additional containers in the pod that support the main application. Common sidecars: log shippers (Fluent Bit), monitoring agents (Prometheus node exporter), service mesh proxies (Istio Envoy), and certificate managers.

CloudMart uses a Fluent Bit sidecar for log shipping. The application writes logs to a shared volume. Fluent Bit reads and forwards them to Log Analytics.

### 3.5 Pod Security

Pod security context defines security settings: runAsNonRoot prevents running as root user, runAsUser sets a specific user ID, readOnlyRootFilesystem makes the root file system read only, allowPrivilegeEscalation prevents privilege escalation, and seccomp profiles limit available system calls.

CloudMart enforces these settings through Pod Security Standards (restricted level) applied at the namespace level.

### 3.6 DevOps Skills Learned

Pod management teaches me the fundamental unit of Kubernetes deployment, lifecycle management, init patterns, sidecar patterns, and security hardening.

---

## 4. Deployments

### 4.1 Deployment Purpose

A Deployment manages a set of identical pods. You define the desired state: which container image to run, how many replicas, and update strategy. The Deployment creates a ReplicaSet to manage the pods and ensures the actual state matches the desired state.

Deployments are the standard way to run stateless applications in Kubernetes. Every CloudMart microservice runs as a Deployment.

### 4.2 ReplicaSets

A ReplicaSet ensures a specified number of pod replicas are running at all times. If a pod fails, the ReplicaSet creates a replacement. If there are too many pods, it deletes extras. You typically do not manage ReplicaSets directly; the Deployment manages them for you.

### 4.3 Rolling Updates

Rolling updates replace pods gradually with new versions. Kubernetes creates new pods with the updated specification, waits for them to be ready, then terminates old pods. This continues until all pods are updated.

Configuration options: maxSurge controls how many extra pods can be created during update (e.g., 25% means up to 125% of desired replicas), and maxUnavailable controls how many pods can be unavailable during update (e.g., 25% means at least 75% of desired replicas must be running).

CloudMart configures maxSurge: 1 and maxUnavailable: 0 for zero downtime deployments. This creates one new pod before terminating an old one.

### 4.4 Rollback

If an update causes problems, rollback to the previous version with kubectl rollout undo deployment/api-gateway. Kubernetes maintains a revision history (default 10 revisions) and can revert to any previous version.

### 4.5 Deployment Strategies

Recreate: terminate all old pods, then create new ones. Simple but causes downtime. RollingUpdate: replace pods gradually (default and recommended). Blue/Green: run two environments, switch traffic (requires additional tooling). Canary: route small percentage of traffic to new version (requires ingress or service mesh).

CloudMart uses RollingUpdate for most services. The API Gateway can use canary deployment through NGINX ingress canary annotations.

### 4.6 DevOps Skills Learned

Deployment management teaches me update strategies, zero downtime deployment, rollback procedures, and revision management. These skills are essential for reliable application updates.

---

## 5. Services

### 5.1 Service Types

A Service exposes a set of pods as a network service. Kubernetes assigns a stable IP address and DNS name to the service, regardless of which pods are backing it. Three main types: ClusterIP (internal cluster access only), LoadBalancer (exposes externally using a cloud load balancer), and NodePort (exposes on each node's IP at a static port).

### 5.2 ClusterIP

ClusterIP is the default service type. It assigns an internal IP address reachable only within the cluster. Other pods access the service through this IP or the service DNS name. All CloudMart internal services use ClusterIP.

### 5.3 LoadBalancer

LoadBalancer exposes a service externally using Azure Load Balancer. When you create a LoadBalancer service in AKS, Azure provisions a public IP and load balancer rule. This is used for the ingress controller service.

### 5.4 Service Discovery

Kubernetes DNS (CoreDNS) resolves service names to cluster IPs. A service named product-service in the cloudmart namespace is accessible at product-service.cloudmart.svc.cluster.local. Within the same namespace, just product-service resolves correctly.

CloudMart services discover each other through DNS names. The API Gateway routes to http://product-service:8080. The Order Service calls http://payment-service:8080.

### 5.5 Headless Services

A headless service (clusterIP: None) does not assign a cluster IP. DNS queries return the pod IPs directly. This is useful for stateful sets where pods need direct communication, or when you want to implement your own load balancing.

### 5.6 DevOps Skills Learned

Service management teaches me internal networking, service discovery, load balancing, and DNS resolution within Kubernetes. These skills are essential for microservices communication.

---

## 6. Ingress

### 6.1 Ingress Concept

Ingress exposes HTTP and HTTPS routes from outside the cluster to services inside the cluster. You define rules: requests to /api/products go to the Product Service, requests to /api/orders go to the Order Service.

Ingress requires an Ingress Controller to implement the rules. The controller reads Ingress resources and configures a load balancer or proxy accordingly.

### 6.2 Ingress Controller

CloudMart uses the NGINX Ingress Controller. It runs as a pod in the cluster and configures an NGINX proxy based on Ingress resources. The controller service is exposed through Azure LoadBalancer, receiving external traffic.

Installation through Helm: helm install ingress-nginx ingress-nginx/ingress-nginx --create-namespace --namespace ingress-nginx

### 6.3 TLS Configuration

TLS is terminated at the ingress. The ingress controller serves HTTPS using certificates from Kubernetes Secrets. cert-manager automatically provisions certificates from Let's Encrypt.

CloudMart configures: a ClusterIssuer for Let's Encrypt production, an Ingress annotation triggering certificate issuance, and automatic HTTP to HTTPS redirection.

### 6.4 Path and Host Routing

The CloudMart Ingress resource:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cloudmart-ingress
  namespace: cloudmart
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.cloudmart.com
    secretName: cloudmart-tls
  rules:
  - host: api.cloudmart.com
    http:
      paths:
      - path: /api/products
        pathType: Prefix
        backend:
          service:
            name: product-service
            port:
              number: 8080
      - path: /api/orders
        pathType: Prefix
        backend:
          service:
            name: order-service
            port:
              number: 8080
      - path: /api/cart
        pathType: Prefix
        backend:
          service:
            name: cart-service
            port:
              number: 8080
```

### 6.5 Rate Limiting and Annotations

NGINX ingress supports rate limiting through annotations: nginx.ingress.kubernetes.io/limit-rps limits requests per second per IP, and nginx.ingress.kubernetes.io/limit-connections limits concurrent connections per IP.

CloudMart configures rate limiting on the ingress to protect against DDoS and brute force attacks before they reach application pods.

### 6.6 DevOps Skills Learned

Ingress management teaches me external traffic routing, TLS termination, path based routing, and rate limiting at the edge. These skills are essential for internet facing applications.

---

## 7. ConfigMaps and Secrets

### 7.1 ConfigMaps for Configuration

ConfigMaps store non sensitive configuration data as key value pairs or files. They are mounted as files or injected as environment variables into pods.

CloudMart uses ConfigMaps for: application settings like log levels and feature flags, NGINX configuration for the ingress controller, and Prometheus scrape configuration.

### 7.2 Secrets for Sensitive Data

Secrets store sensitive data like passwords, tokens, and keys. Kubernetes stores secrets in etcd in base64 encoding (not encryption by default). Access is controlled through RBAC.

CloudMart minimizes Kubernetes secrets by using Azure Key Vault for most secrets. Only non Azure secrets (like internal JWT signing keys) are stored as Kubernetes secrets.

### 7.3 Mounting as Files

ConfigMaps and Secrets can be mounted as files in the pod. Changes to the ConfigMap are reflected in mounted files without pod restart (with some delay).

```yaml
volumes:
- name: config
  configMap:
    name: product-service-config
containers:
- volumeMounts:
  - name: config
    mountPath: /app/config
```

### 7.4 Environment Variables

Values can be injected as environment variables:

```yaml
env:
- name: ASPNETCORE_ENVIRONMENT
  valueFrom:
    configMapKeyRef:
      name: product-service-config
      key: environment
```

### 7.5 External Secrets with Key Vault

The Azure Key Vault Provider for Secrets Store CSI Driver integrates Key Vault with Kubernetes. Secrets from Key Vault are mounted as files in the pod. The pod's managed identity authenticates to Key Vault.

CloudMart configuration:

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: cloudmart-keyvault
spec:
  provider: azure
  parameters:
    usePodIdentity: "false"
    useVMManagedIdentity: "true"
    userAssignedIdentityID: ""
    keyvaultName: "cloudmart-prod-kv"
    cloudName: ""
    objects: |
      array:
        - |
          objectName: sql-connection-string
          objectType: secret
        - |
          objectName: redis-connection-string
          objectType: secret
    tenantId: "xxx"
  secretObjects:
  - secretName: sql-secret
    type: Opaque
    data:
    - objectName: sql-connection-string
      key: connection-string
```

### 7.6 DevOps Skills Learned

Configuration management teaches me the Kubernetes patterns for configuration and secrets, and the integration with external secret stores like Key Vault. These skills are essential for secure configuration management.

---

## 8. Persistent Volumes

### 8.1 Storage Concepts

Persistent Volumes provide storage that outlives individual pods. A PersistentVolume is a piece of storage in the cluster provisioned by an administrator or dynamically provisioned. A PersistentVolumeClaim is a request for storage by a user.

### 8.2 Azure Disk CSI Driver

Azure Disk provides block storage mounted as a volume in a pod. Disks are zone specific and can only be mounted to one pod at a time (ReadWriteOnce). This is suitable for databases running in pods.

CloudMart does not run databases in pods (we use Azure SQL Database), so Azure Disk is used sparingly, mainly for Redis persistence on the cache tier.

### 8.3 Azure Files CSI Driver

Azure Files provides SMB file shares that can be mounted by multiple pods simultaneously (ReadWriteMany). This is suitable for shared storage like configuration or uploaded files.

### 8.4 Storage Classes

Storage Classes define different tiers of storage. AKS provides several default classes: managed-csi (standard SSD), managed-csi-premium (premium SSD), and managed-csi-premium-zrs (zone redundant premium).

### 8.5 Volume Claims

A PersistentVolumeClaim requests storage from a StorageClass:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: managed-csi-premium
  resources:
    requests:
      storage: 10Gi
```

### 8.6 DevOps Skills Learned

Storage management teaches me persistent storage patterns, CSI drivers, storage classes, and volume management in Kubernetes. These skills are needed for stateful workloads.

---

## 9. Autoscaling

### 9.1 Horizontal Pod Autoscaler

The Horizontal Pod Autoscaler adjusts the number of pod replicas based on observed metrics. It scales up when metrics exceed the target and scales down when they fall below.

Configuration for the Product Service:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: product-service-hpa
  namespace: cloudmart
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: product-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

The stabilizationWindowSeconds of 300 means HPA will not scale down for 5 minutes after the last scale up, preventing flapping.

### 9.2 Cluster Autoscaler

Cluster Autoscaler adds or removes nodes based on pending pods. If pods cannot be scheduled due to insufficient resources, Cluster Autoscaler provisions a new node. If nodes are underutilized and pods can be rescheduled to other nodes, it removes the underutilized node.

CloudMart enables Cluster Autoscaler on the general node pool with min count 3 and max count 10.

### 9.3 Vertical Pod Autoscaler

VPA adjusts CPU and memory requests for pods based on actual usage. Unlike HPA which scales replicas, VPA scales individual pod resources. VPA requires pod restarts to apply changes, making it less suitable for stateless web applications that should scale horizontally.

CloudMart does not use VPA. Instead, we right size resource requests through load testing and monitoring.

### 9.4 KEDA for Event Driven Scaling

KEDA (Kubernetes Event Driven Autoscaling) scales pods based on external event sources like message queue depth. If the Service Bus queue has 1000 messages, KEDA scales the notification processor to 10 pods. When the queue empties, it scales to zero.

CloudMart uses KEDA for the notification service, scaling based on Service Bus subscription message count.

### 9.5 Scaling Policies

Scale up should be fast (add capacity quickly during traffic spikes). Scale down should be slow (wait to ensure the load has truly decreased). Cooldown periods prevent flapping. Always set max replicas to prevent runaway scaling.

### 9.6 DevOps Skills Learned

Autoscaling teaches me horizontal and vertical scaling patterns, cluster capacity management, event driven scaling, and scaling policy design. These skills are essential for cost efficient operations.

---

## 10. Scheduling

### 10.1 How Scheduling Works

When a pod is created, the Kubernetes scheduler determines which node should run it. The scheduler considers: resource requests (CPU and memory), node selectors and affinity rules, taints and tolerations, pod affinity and anti affinity, and priority classes.

### 10.2 Taints and Tolerations

Taints repel pods from nodes. A node with a CriticalAddonsOnly taint will not accept pods unless they have a matching toleration. Taints are used for the system node pool to prevent application pods from scheduling on infrastructure nodes.

CloudMart applies the CriticalAddonsOnly=true:NoSchedule taint to system nodes. Only pods with the matching toleration (like the ingress controller and cert manager) can schedule there.

### 10.3 Node Affinity

Node affinity rules attract pods to specific nodes based on labels. Required affinity is a hard requirement (pod will not schedule if not met). Preferred affinity is a soft preference (scheduler tries but will schedule elsewhere if needed).

CloudMart uses node affinity to prefer the general node pool for application pods and the spot node pool for background jobs.

### 10.4 Pod Affinity and Anti Affinity

Pod anti affinity spreads pods across nodes for high availability. CloudMart configures pod anti affinity to ensure replicas of the same service run on different nodes and in different availability zones.

```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - product-service
        topologyKey: kubernetes.io/hostname
```

### 10.5 Resource Requests and Limits

Resource requests guarantee a pod receives at least that much CPU and memory. Limits cap the maximum a pod can use. If a pod exceeds its memory limit, it is terminated (OOMKilled). If it exceeds its CPU limit, it is throttled.

CloudMart configures requests based on load testing: 250m CPU and 256Mi memory for most services. Limits are set 2x higher than requests: 500m CPU and 512Mi memory.

### 10.6 DevOps Skills Learned

Scheduling teaches me placement control, resource management, high availability through distribution, and capacity planning. These skills are essential for reliable cluster operations.

---

## 11. Networking

### 11.1 CNI Plugins

Container Network Interface plugins implement pod networking. AKS supports Azure CNI ( pods get VNET IPs) and Kubenet (pods get overlay IPs with NAT). CloudMart uses Azure CNI for direct VNET connectivity.

### 11.2 Azure CNI

With Azure CNI, each pod gets an IP address from the VNET subnet. This provides: direct pod to pod communication without NAT, access to private endpoints without additional routing, and network policies for security. The tradeoff is IP address consumption: a /24 subnet supports only about 250 pods because Azure reserves some IPs.

### 11.3 Network Policies

Network Policies control traffic between pods. By default, all pods can communicate with all other pods. Network policies restrict this.

CloudMart's default deny policy:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: cloudmart
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

Allow policy for the API Gateway:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-gateway-policy
  namespace: cloudmart
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app.kubernetes.io/name: ingress-nginx
  - to:
    - podSelector:
        matchLabels:
          app: product-service
    ports:
    - protocol: TCP
      port: 8080
  - to:
    - podSelector:
        matchLabels:
          app: order-service
    ports:
    - protocol: TCP
      port: 8080
```

### 11.4 Service Mesh Introduction

A service mesh adds observability, security, and traffic management to service to service communication without modifying application code. Istio is the most popular service mesh. It deploys a sidecar proxy (Envoy) alongside each pod that intercepts all network traffic.

CloudMart does not use a service mesh initially. If the complexity of managing service communication grows, Istio would be evaluated for mTLS between services, traffic splitting for canary deployments, and advanced observability.

### 11.5 DNS in Kubernetes

Kubernetes DNS (CoreDNS) runs in the cluster and resolves service names to cluster IPs. DNS configuration: queries for services in the same namespace resolve by service name, queries for services in other namespaces use the full name service.namespace.svc.cluster.local, and external DNS queries are forwarded to Azure DNS.

### 11.6 DevOps Skills Learned

Kubernetes networking teaches me CNI configuration, network policies for security, service mesh concepts, and DNS resolution within the cluster. These skills are essential for secure microservices networking.

---

## 12. RBAC and Security

### 12.1 Service Accounts

Service accounts provide an identity for pods. When a pod makes API requests to the Kubernetes API server, it authenticates as its service account. Service accounts can be granted permissions through RBAC.

CloudMart creates dedicated service accounts for each application. The API Gateway service account has permissions to read ConfigMaps and Secrets in its namespace. It does not have permissions to create or delete resources.

### 12.2 Roles and ClusterRoles

A Role defines permissions within a namespace. A ClusterRole defines permissions across all namespaces. Permissions are granted on resources (pods, services, configmaps) with verbs (get, list, create, update, delete).

### 12.3 RoleBindings

RoleBindings assign Roles or ClusterRoles to users, groups, or service accounts. A RoleBinding grants permissions within a specific namespace. A ClusterRoleBinding grants permissions across all namespaces.

### 12.4 Pod Security Standards

Pod Security Standards define three security levels: Privileged (unrestricted), Baseline (minimally restrictive, prevents known privilege escalations), and Restricted (heavily restricted, follows pod hardening best practices).

CloudMart enforces the Restricted standard on the cloudmart namespace:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: cloudmart
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

This enforces: pods must run as non root, must not allow privilege escalation, must drop all capabilities, must use a restricted seccomp profile, and must have a read only root file system.

### 12.5 Network Policies

Network policies are covered in section 11.3. They are a critical security layer that restricts which pods can communicate.

### 12.6 DevOps Skills Learned

Kubernetes security teaches me RBAC design, pod hardening, namespace isolation, and defense in depth for containerized applications. These skills are essential for production security.

---

## 13. Helm Package Management

### 13.1 Helm Concepts

Helm is the package manager for Kubernetes. It packages Kubernetes manifests into reusable units called charts. Charts can be parameterized for different environments through values files.

CloudMart uses Helm to package each microservice. The Helm chart contains: deployment.yaml, service.yaml, ingress.yaml, configmap.yaml, hpa.yaml, and serviceaccount.yaml templates.

### 13.2 Chart Structure

```
product-service-chart/
├── Chart.yaml
├── values.yaml
├── values-production.yaml
├── templates/
│   ├── _helpers.tpl
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── hpa.yaml
│   └── serviceaccount.yaml
└── charts/
```

### 13.3 Values Files

values.yaml defines default values. Environment specific files override defaults. values-production.yaml sets replicaCount: 3, resource requests/limits for production, and production specific configuration.

### 13.4 Template Functions

Helm templates use Go template syntax with Helm specific functions. Templates generate Kubernetes YAML based on values. The _helpers.tpl file defines reusable template snippets.

### 13.5 Chart Dependencies

Charts can depend on other charts. The API Gateway chart depends on the Redis subchart for rate limiting storage. Dependencies are defined in Chart.yaml and installed automatically.

### 13.6 DevOps Skills Learned

Helm teaches me Kubernetes package management, templating, configuration management, and release management. These skills are essential for managing complex Kubernetes applications.

---

## 14. Observability

### 14.1 Health Checks

Kubernetes probes determine container health: Liveness probe (detects deadlocked processes, triggers restart if failing), Readiness probe (determines if pod should receive traffic, removes from service if failing), and Startup probe (for slow starting applications, disables other probes until successful).

CloudMart configures all three probes for every service. The liveness probe hits /health/live, readiness hits /health/ready, and startup hits /health/startup.

### 14.2 Metrics with Prometheus

Prometheus scrapes metrics from pods at configured intervals. Pods expose metrics at /metrics in Prometheus text format. The Prometheus server stores time series data. Grafana queries Prometheus and displays dashboards.

CloudMart exposes: request count and latency histograms, application specific business metrics (orders per minute), JVM/CLR runtime metrics (GC, memory, threads), and custom metrics for business KPIs.

### 14.3 Logging Patterns

Containers should log to stdout/stderr. Kubernetes captures this output. A log collector (Fluent Bit running as a DaemonSet) forwards logs to Log Analytics.

CloudMart uses structured JSON logging with correlation IDs. Every log entry includes: timestamp, level, message, correlation ID, service name, and pod name.

### 14.4 Tracing

Distributed tracing follows requests across service boundaries. OpenTelemetry instruments applications to generate spans. Spans are collected by the OpenTelemetry Collector and forwarded to Jaeger for storage and visualization.

CloudMart configures OpenTelemetry automatic instrumentation for .NET. The collector receives traces and exports them to both Jaeger (for development) and Application Insights (for production).

### 14.5 DevOps Skills Learned

Observability teaches me the three pillars of monitoring (metrics, logs, traces), health check design, and instrumentation patterns. These skills are fundamental for SRE.

---

## 15. Troubleshooting

### 15.1 Common Issues

Common Kubernetes issues: Pod stuck in Pending (insufficient resources, taints, or scheduling constraints), Pod in CrashLoopBackOff (application crashing on startup, check logs), Pod not ready (readiness probe failing, dependencies unavailable), Service not accessible (selector mismatch, endpoints not created), and Ingress not routing (ingress class mismatch, TLS certificate issues).

### 15.2 Debugging Commands

Essential kubectl commands: kubectl get pods (list pods), kubectl describe pod (detailed pod information including events), kubectl logs (container logs), kubectl logs --previous (logs from previous container instance after restart), kubectl exec (execute commands inside a container), kubectl port-forward (forward local port to pod), kubectl top pod (resource usage), and kubectl get events (cluster events).

### 15.3 Log Analysis

For stuck pods, kubectl describe pod shows events explaining why. For crashing pods, kubectl logs --previous shows the crash output. For performance issues, kubectl top pod and kubectl top node show resource usage.

### 15.4 Network Debugging

From inside a pod: wget or curl to test connectivity to other services, nslookup to test DNS resolution, and netstat to check listening ports. From a debug pod with network tools: deploy a temporary pod with debugging tools for advanced network troubleshooting.

### 15.5 DevOps Skills Learned

Troubleshooting teaches me systematic debugging methodology for Kubernetes: identifying symptoms, gathering information with kubectl, analyzing logs and events, and applying fixes. These skills reduce incident resolution time.

---

## What I Have Accomplished in This Volume

This volume documented the complete Kubernetes architecture for CloudMart on AKS. I covered Kubernetes fundamentals and architecture, AKS cluster design with node pools and networking, Pods with lifecycle, init containers, sidecars, and security, Deployments with rolling updates and rollback strategies, Services with discovery and load balancing, Ingress with NGINX controller and TLS, ConfigMaps and Secrets with Key Vault integration, Persistent Volumes with Azure storage, Autoscaling with HPA, cluster autoscaler, and KEDA, Scheduling with taints, affinity, and resource management, Networking with CNI, network policies, and DNS, RBAC and Pod Security Standards, Helm package management, Observability with health checks, metrics, logs, and tracing, and Troubleshooting methodology.

**DevOps skills learned in this volume:** Kubernetes cluster design, pod management, deployment strategies, service networking, ingress configuration, secret management, autoscaling, scheduling, network policies, RBAC, Helm packaging, and observability instrumentation.

**Interview questions this prepares me for:** How does Kubernetes scheduling work? How do you implement zero downtime deployments? What is the difference between a liveness and readiness probe? How do you secure pod to pod communication? How does HPA work and what metrics can it use? How do you troubleshoot a pod stuck in CrashLoopBackOff? What is a service mesh and when would you use one?

**Real world engineering problem this solves:** Operating production Kubernetes clusters is the core responsibility of platform engineers and DevOps engineers. This volume provides the comprehensive knowledge needed to deploy, secure, scale, and troubleshoot containerized applications on AKS.

**Azure services being mastered:** Azure Kubernetes Service, Azure CNI, Azure Load Balancer, Azure Disk CSI, Azure Files CSI.

**DevOps concepts being mastered:** Container orchestration, declarative infrastructure, service discovery, load balancing, autoscaling, pod security, network policies, package management, and observability.

---

End of Volume 7