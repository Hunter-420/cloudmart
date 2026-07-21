# Volume 6: Docker Containerization

## The Purpose of This Volume

This volume provides comprehensive documentation for containerizing the CloudMart platform using Docker. Containerization is the practice of packaging applications with their dependencies into portable units that run consistently across environments. Docker is the industry standard container platform and the foundation for Kubernetes orchestration.

Understanding Docker deeply matters because it underpins every deployment in the CloudMart platform. Every microservice runs as a Docker container on AKS. The quality of container images directly impacts application performance, security, startup time, and resource efficiency.

This volume covers Docker architecture, image construction, multi stage builds, networking, storage, security, optimization, and production deployment patterns. It includes complete Dockerfile examples for each CloudMart service.

---

## Detailed Table of Contents

1. Containerization Fundamentals
   1.1 What Containers Are and Why They Exist
   1.2 Containers vs Virtual Machines
   1.3 The Open Container Initiative
   1.4 Docker's Role in the Ecosystem
   1.5 DevOps Skills Learned

2. Docker Architecture
   2.1 Docker Engine Components
   2.2 Client Server Architecture
   2.3 containerd and runc
   2.4 Linux Namespaces and cgroups
   2.5 DevOps Skills Learned

3. Docker Images
   3.1 Image Concept and Structure
   3.2 Layered File System
   3.3 Base Image Selection
   3.4 Image Naming and Tagging
   3.5 DevOps Skills Learned

4. Dockerfile Design
   4.1 Dockerfile Instructions
   4.2 Layer Caching Strategy
   4.3 Build Context Optimization
   4.4 Complete Dockerfile Examples
   4.5 DevOps Skills Learned

5. Multi Stage Builds
   5.1 Why Multi Stage Builds Matter
   5.2 Build Stage Design
   5.3 Runtime Stage Design
   5.4 Complete Multi Stage Examples
   5.5 DevOps Skills Learned

6. Docker Networking
   6.1 Network Drivers
   6.2 Bridge Networks
   6.3 Overlay Networks
   6.4 Host and None Networks
   6.5 Service Discovery
   6.6 DevOps Skills Learned

7. Docker Storage
   7.1 Storage Drivers
   7.2 Volumes
   7.3 Bind Mounts
   7.4 tmpfs Mounts
   7.5 Persistent Data Patterns
   7.6 DevOps Skills Learned

8. Container Security
   8.1 Image Security
   8.2 Runtime Security
   8.3 Network Security
   8.4 Secret Management
   8.5 Security Scanning
   8.6 DevOps Skills Learned

9. Image Optimization
   9.1 Size Reduction Techniques
   9.2 Build Time Optimization
   9.3 Runtime Performance
   9.4 Base Image Selection
   9.5 DevOps Skills Learned

10. Production Deployment
    10.1 Image Registry Strategy
    10.2 Tagging for Production
    10.3 Deployment Patterns
    10.4 Health Checks
    10.5 Graceful Shutdown
    10.6 DevOps Skills Learned

11. Docker Compose
    11.1 Local Development Setup
    11.2 Service Definitions
    11.3 Network Configuration
    11.4 Volume Configuration
    11.5 DevOps Skills Learned

12. Troubleshooting
    12.1 Common Issues
    12.2 Debugging Commands
    12.3 Log Analysis
    12.4 Performance Profiling
    12.5 DevOps Skills Learned

---

## 1. Containerization Fundamentals

### 1.1 What Containers Are and Why They Exist

Before containers, deploying applications was painful. A developer would write code on their laptop using specific versions of libraries and frameworks. When it came time to deploy, the operations team would provision a server, install what they believed were the correct dependencies, copy the application files, and hope it worked. The phrase "it works on my machine" was not a joke. It was a daily reality that caused friction between development and operations teams.

The problem was environmental inconsistency. The developer's laptop ran macOS with Node.js version 14.2. The staging server ran Ubuntu with Node.js 14.0. The production server ran CentOS with Node.js 14.3 installed from a different package source. A library that worked locally failed in staging because of a subtle difference in the operating system libraries. A feature that passed QA broke in production because the Node.js patch version behaved differently.

Virtual machines solved some of this by packaging the entire operating system with the application. But VMs are heavy. Each VM runs a full operating system kernel, consuming gigabytes of memory and taking minutes to start. Running hundreds of VMs is expensive and slow.

Containers provide a lighter solution. A container packages the application with its dependencies but shares the host operating system kernel. Multiple containers run on the same host, each isolated from the others, but all using the same underlying kernel. This makes containers orders of magnitude lighter and faster than VMs.

A container includes: the application binaries, runtime dependencies like .NET runtime or Node.js, system libraries required by the application, and configuration files. It does not include: a separate operating system kernel, hardware virtualization layer, or boot process. The host kernel is shared.

### 1.2 Containers vs Virtual Machines

Virtual machines virtualize the hardware. A hypervisor creates virtual hardware: CPU, memory, disk, and network interfaces. Each VM boots a complete guest operating system on this virtual hardware. The guest OS has its own kernel, drivers, and system services. This provides strong isolation because each VM is essentially a separate computer. But the overhead is significant.

A typical VM might require 2 GB of memory just for the operating system before running any application. Starting a VM means booting an operating system, which takes 30 to 60 seconds. A physical server might run 10 to 20 VMs.

Containers virtualize the operating system. The host OS kernel provides isolation through namespaces (which limit what a container can see) and control groups (which limit what a container can use). Each container gets its own process space, file system, and network interfaces, but shares the host kernel. This is lighter because there is no duplicate kernel or system services.

A container might use 50 MB of memory and start in less than a second. A physical server can run hundreds of containers. The tradeoff is weaker isolation: containers share the kernel, so a kernel vulnerability affects all containers on the host.

For CloudMart, containers are the right choice because: the platform runs many microservices that need to start quickly for scaling, the resource efficiency of containers reduces infrastructure costs, the rapid startup enables fast deployment and recovery, and Kubernetes provides the orchestration layer that makes container management at scale practical.

### 1.3 The Open Container Initiative

The Open Container Initiative is a Linux Foundation project that defines open standards for container formats and runtimes. The OCI Image Specification defines the format for container images. The OCI Runtime Specification defines how containers are executed.

These standards ensure interoperability. A container image built with Docker runs on containerd, CRI-O, or any OCI compliant runtime. A Kubernetes cluster using containerd can run images built by any tool that produces OCI compliant output.

Docker, Podman, Buildah, and other tools all produce OCI compliant images. This standardization prevents vendor lock in and ensures portability across container runtimes.

### 1.4 Docker's Role in the Ecosystem

Docker is both a platform and a company. The Docker platform includes: Docker Engine (the container runtime), Docker CLI (the command line interface), Docker Build (the image building system), Docker Hub (a public image registry), and Docker Compose (local multi container orchestration).

Docker popularized containers but the underlying technology existed in Linux for years. Docker made containers accessible by providing a simple user experience, a packaging format, and a distribution mechanism. Today, Docker Engine uses containerd as the runtime and runc as the low level container executor, both of which are Cloud Native Computing Foundation projects.

For CloudMart, Docker is the development and build tool. Developers use Docker Desktop locally. CI/CD pipelines use Docker Build to create images. Kubernetes uses containerd to run containers. Docker Hub or Azure Container Registry stores the images.

### 1.5 DevOps Skills Learned

Containerization fundamentals teach me the core concepts of modern application deployment: process isolation, layered file systems, image portability, and the relationship between containers and VMs. These concepts are assumed knowledge for any cloud native role.

---

## 2. Docker Architecture

### 2.1 Docker Engine Components

Docker Engine is the container runtime. It consists of three main components working together: the Docker daemon (dockerd), the container runtime (containerd and runc), and the Docker API.

The Docker daemon is a persistent background process that manages Docker objects: images, containers, networks, and volumes. It listens for API requests from the Docker client and manages the lifecycle of containers. The daemon handles image building, container execution, networking, and storage.

The Docker client is the command line interface that sends commands to the daemon. When you type docker run, the client sends a request to the daemon through a REST API (by default over a Unix socket on Linux or a named pipe on Windows).

### 2.2 Client Server Architecture

Docker uses a client server architecture. The Docker client talks to the Docker daemon. They can run on the same system (the common case for development) or on different systems (using the DOCKER_HOST environment variable to connect to a remote daemon).

This architecture means that docker commands are actually API calls. You can interact with Docker programmatically using the API directly. Kubernetes interacts with container runtimes through the Container Runtime Interface, which containerd implements.

### 2.3 containerd and runc

containerd is a high level container runtime that manages the complete container lifecycle: creating, starting, stopping, and destroying containers. It handles image transfer, image storage, container execution, and low level storage. containerd was originally part of Docker but was extracted as an independent project donated to the CNCF.

c runc is a low level container runtime that creates and runs containers according to the OCI specification. It sets up namespaces, control groups, and security profiles, then executes the container process. containerd calls runc to actually run containers.

When you run docker run, the flow is: Docker CLI sends request to Docker daemon, Docker daemon calls containerd, containerd pulls the image if needed, containerd calls runc to create and start the container, runc sets up isolation and executes the container process, and containerd monitors the container and reports status back to Docker daemon.

### 2.4 Linux Namespaces and cgroups

Containers use Linux kernel features for isolation. Namespaces limit what a container can see. There are several namespace types: PID namespace isolates process IDs so containers only see their own processes, Network namespace provides a separate network stack with its own interfaces and routing tables, Mount namespace isolates mount points so containers have their own file system view, UTS namespace isolates hostname and domain name, IPC namespace isolates inter process communication, and User namespace maps container users to different host users for security.

Control groups (cgroups) limit what a container can use. They control CPU usage, memory limits, block IO bandwidth, and network bandwidth. Kubernetes resource requests and limits are implemented through cgroups.

### 2.5 DevOps Skills Learned

Docker architecture teaches me how containers actually work at the kernel level. This knowledge is essential for debugging container issues, optimizing performance, and understanding Kubernetes internals.

---

## 3. Docker Images

### 3.1 Image Concept and Structure

A Docker image is a read only template that contains the application and everything needed to run it. Images are built from a Dockerfile and stored in a registry. When you start a container, Docker creates a writable layer on top of the image layers. Any changes the container makes go into this writable layer, leaving the image unchanged.

This immutability is powerful. The same image runs in development, staging, and production. Differences between environments are handled through environment variables and mounted configuration, not through different images. This eliminates the "works on my machine" problem.

### 3.2 Layered File System

Docker images are built from layers. Each instruction in a Dockerfile creates a new layer. Layers are cached and shared between images. If multiple images use the same base layer, that layer is stored only once on disk.

The layer structure uses a union file system. When a container reads a file, the system looks through the layers from top to bottom and returns the file from the first layer that contains it. When a container writes a file, the copy is written to the writable container layer. This is called copy on write.

Layer caching speeds up builds significantly. When you rebuild an image, Docker reuses layers that have not changed. Only layers after the changed instruction are rebuilt. To maximize cache hits, order Dockerfile instructions from least frequently changing to most frequently changing.

### 3.3 Base Image Selection

The base image is the foundation of your container. CloudMart services use these base images: ASP.NET Core runtime (mcr.microsoft.com/dotnet/aspnet:8.0) for the runtime stage, ASP.NET Core SDK (mcr.microsoft.com/dotnet/sdk:8.0) for the build stage, and Alpine Linux variants (tagged with 8.0-alpine) where possible for smaller size.

Alpine Linux is a minimal distribution designed for containers. It is much smaller than Debian or Ubuntu based images. However, it uses musl libc instead of glibc, which can cause compatibility issues with some libraries. For .NET applications, Microsoft provides Alpine based images that are fully supported.

Distroless images from Google contain only the application and its runtime dependencies, without package managers, shells, or other tools. This reduces attack surface significantly. For CloudMart, we use Microsoft's distroless images for production deployments.

### 3.4 Image Naming and Tagging

Images are named with the format: registry/repository:tag. Examples: cloudmartprod.azurecr.io/api-gateway:1.2.3, cloudmartprod.azurecr.io/api-gateway:abc123def (git SHA), and cloudmartprod.azurecr.io/api-gateway:latest.

Tagging strategy for CloudMart: use the Git commit SHA for immutable references, use semantic versions (v1.2.3) for release identification, use latest only for the current production deployment, and never use latest in Kubernetes manifests because it is mutable and unpredictable.

### 3.5 DevOps Skills Learned

Image management teaches me layer optimization, base image selection, tagging strategies, and registry management. These skills directly impact build speed, image size, and deployment reliability.

---

## 4. Dockerfile Design

### 4.1 Dockerfile Instructions

A Dockerfile is a text file containing instructions for building an image. Key instructions: FROM specifies the base image, WORKDIR sets the working directory, COPY copies files from the build context, RUN executes commands during build, ENV sets environment variables, EXPOSE documents ports, USER sets the runtime user, ENTRYPOINT configures the container executable, and CMD provides default arguments.

### 4.2 Layer Caching Strategy

To maximize build cache hits, order instructions from least to most frequently changing: first, the FROM instruction (base image changes rarely), second, dependency installation (dependencies change when updated), third, application code copy (code changes on every commit), and fourth, runtime configuration.

For .NET applications, this means: copy the project file first, run dotnet restore, then copy the source code, then run dotnet build and dotnet publish. This way, restore is cached unless the project file changes, which is much less frequent than source code changes.

### 4.3 Build Context Optimization

The build context is the set of files sent to the Docker daemon for building. Large build contexts slow down builds. Use .dockerignore to exclude files that are not needed for the build: bin/, obj/, .git/, *.md, Dockerfile*, and docker-compose*.

### 4.4 Complete Dockerfile Examples

API Gateway Dockerfile:

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY src/CloudMart.ApiGateway/CloudMart.ApiGateway.csproj ./
RUN dotnet restore --runtime linux-musl-x64

# Copy source and build
COPY src/CloudMart.ApiGateway/. ./
RUN dotnet publish \
    -c Release \
    --runtime linux-musl-x64 \
    --self-contained false \
    -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app

# Create non-root user
RUN adduser --disabled-password --home /app --gecos '' appuser && chown -R appuser /app
USER appuser

# Copy published application
COPY --from=build /app/publish .

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health/live || exit 1

# Expose port and configure entrypoint
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "CloudMart.ApiGateway.dll"]
```

Product Service Dockerfile:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# Copy project files for dependency restoration
COPY src/CloudMart.ProductService/CloudMart.ProductService.csproj ./
COPY src/CloudMart.Shared/CloudMart.Shared.csproj ../CloudMart.Shared/
RUN dotnet restore CloudMart.ProductService.csproj --runtime linux-musl-x64

# Copy source and build
COPY src/CloudMart.ProductService/. ./
COPY src/CloudMart.Shared/. ../CloudMart.Shared/
RUN dotnet publish CloudMart.ProductService.csproj \
    -c Release \
    --runtime linux-musl-x64 \
    --self-contained false \
    -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app
RUN adduser --disabled-password --home /app --gecos '' appuser && chown -R appuser /app
USER appuser

COPY --from=build /app/publish .

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health/live || exit 1

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "CloudMart.ProductService.dll"]
```

### 4.5 DevOps Skills Learned

Dockerfile design teaches me image construction, layer optimization, build context management, and security hardening. These skills directly impact the quality of deployed containers.

---

## 5. Multi Stage Builds

### 5.1 Why Multi Stage Builds Matter

In a single stage build, the final image contains everything used during building: the SDK, build tools, compiler, source code, and intermediate files. This bloats the image size and increases the attack surface. A single stage .NET image might be 600 MB because it includes the full SDK.

Multi stage builds use multiple FROM instructions. The first stages build the application with all tools. The final stage copies only the compiled artifacts into a minimal runtime image. The build stages are discarded, leaving only the lean runtime stage.

A multi stage .NET image might be 120 MB: the runtime base is 100 MB and the application adds 20 MB. This is 5x smaller than the single stage equivalent.

### 5.2 Build Stage Design

The build stage uses the SDK image which contains compilers and build tools. It copies project files, restores dependencies, copies source code, compiles, and publishes. The publish output is placed in a known directory for the runtime stage to copy.

### 5.3 Runtime Stage Design

The runtime stage uses the minimal runtime image. It creates a non root user for security, copies only the published artifacts from the build stage, configures health checks, exposes the application port, and sets the entrypoint.

### 5.4 Complete Multi Stage Examples

All CloudMart Dockerfiles use multi stage builds. The pattern is consistent: SDK image for build, runtime image for production. This consistency enables automation: the CI/CD pipeline builds all services the same way.

### 5.5 DevOps Skills Learned

Multi stage builds teach me image size optimization, separation of build and runtime concerns, and security through minimal attack surface. These skills are essential for production container deployments.

---

## 6. Docker Networking

### 6.1 Network Drivers

Docker supports several network drivers: bridge (the default for standalone containers), host (shares the host network stack), overlay (for multi host networking in Docker Swarm), macvlan (assigns a MAC address for direct network access), and none (disables networking).

On Kubernetes, networking is more sophisticated. Each pod gets its own IP address. All pods can communicate with all other pods without NAT. This flat network model simplifies service discovery and load balancing.

### 6.2 Bridge Networks

The bridge network is the default for Docker containers on a single host. Containers on the same bridge network can communicate using container names as DNS names. This is useful for local development with Docker Compose.

### 6.3 Overlay Networks

Overlay networks enable containers on different Docker hosts to communicate. This is used in Docker Swarm and Kubernetes for pod networking across nodes.

### 6.4 Host and None Networks

Host network mode removes network isolation, using the host's network stack directly. This provides the best performance but eliminates network isolation. None mode disables all networking, used for containers that do not need network access.

### 6.5 Service Discovery

In Docker Compose, containers can reach each other by service name. In Kubernetes, DNS based service discovery resolves service names to cluster IP addresses. CloudMart services discover each other through Kubernetes DNS rather than Docker networking.

### 6.6 DevOps Skills Learned

Docker networking teaches me container network isolation, service discovery, and the relationship between Docker networking and Kubernetes networking. These skills are essential for debugging connectivity issues.

---

## 7. Docker Storage

### 7.1 Storage Drivers

Docker uses storage drivers to manage the layered file system. overlay2 is the recommended driver for modern Linux kernels. It provides efficient layer management and good performance.

### 7.2 Volumes

Volumes are the preferred mechanism for persisting data generated by containers. They are managed by Docker and stored outside the container's file system. Volumes persist when containers are deleted and can be shared between containers.

For CloudMart, persistent data is stored in Azure services (SQL Database, Blob Storage) rather than container volumes. Volumes are used only for temporary data and configuration.

### 7.3 Bind Mounts

Bind mounts map a host directory into the container. They are useful for development where you want changes on the host to be immediately reflected in the container. In production, bind mounts are rarely used because they couple containers to the host file system.

### 7.4 tmpfs Mounts

tmpfs mounts store data in host memory. They are fast but ephemeral. Useful for sensitive data that should not be written to disk, like temporary session tokens.

### 7.5 Persistent Data Patterns

The key principle for containerized applications: containers are ephemeral and stateless. Persistent data belongs in external services. CloudMart follows this principle strictly. No container stores data locally. All state is externalized to SQL Database, Redis, or Blob Storage.

### 7.6 DevOps Skills Learned

Docker storage teaches me data persistence patterns, the ephemeral nature of containers, and when to use external storage versus container volumes. These skills are essential for designing stateless applications.

---

## 8. Container Security

### 8.1 Image Security

Security starts with the base image. Use official images from trusted sources like Microsoft Container Registry or Docker Official Images. Regularly update base images to get security patches. Scan images for vulnerabilities before deployment.

CloudMart implements these image security practices: use Microsoft official images only, enable Azure Container Registry vulnerability scanning with Microsoft Defender, scan every image in CI/CD with Trivy, fail builds that contain critical CVEs, and rebuild and redeploy images weekly to incorporate security patches.

### 8.2 Runtime Security

Containers should run as non root users. The root user inside a container has significant privileges on the host if container isolation is compromised. CloudMart Dockerfiles create and use a dedicated appuser account.

Read only root file systems prevent containers from modifying their own files. This prevents attackers from injecting malware into the container file system. In Kubernetes, readOnlyRootFilesystem is set to true in the pod security context.

drop ALL capabilities removes all Linux capabilities from the container, then add back only the specific ones needed. For most .NET applications, no additional capabilities are needed.

Security contexts in Kubernetes enforce these settings:

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  runAsGroup: 1000
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
```

### 8.3 Network Security

Containers should expose only the ports they need. The API Gateway exposes port 8080. Internal services do not need externally exposed ports in Kubernetes because communication goes through cluster networking.

Network policies in Kubernetes restrict which pods can communicate with each other. CloudMart configures policies that allow the API Gateway to reach services, allow services to reach databases and Redis, and deny all other traffic by default.

### 8.4 Secret Management

Never embed secrets in images. Secrets should be injected at runtime through environment variables (from Kubernetes secrets), mounted files (from Key Vault CSI driver), or configuration providers (like .NET's Azure Key Vault configuration provider).

CloudMart uses the Key Vault CSI driver to mount secrets as files in containers. The application reads secrets from these files at startup. No secrets exist in environment variables or configuration files.

### 8.5 Security Scanning

Trivy is a vulnerability scanner for containers. It scans the OS packages and application dependencies in an image, compares them against vulnerability databases, and reports findings by severity.

CloudMart integrates Trivy into the CI/CD pipeline. Every built image is scanned. Builds fail if critical vulnerabilities are found. Vulnerability reports are uploaded to the build artifacts for review.

### 8.6 DevOps Skills Learned

Container security teaches me defense in depth for containerized applications: secure base images, minimal attack surfaces, non root execution, network policies, and vulnerability scanning. These skills are essential for production security.

---

## 9. Image Optimization

### 9.1 Size Reduction Techniques

Smaller images build faster, deploy faster, use less storage, and reduce attack surface. Techniques for reducing image size: use Alpine or distroless base images, use multi stage builds to exclude build tools, clean package caches in the same RUN layer that installs packages, use .dockerignore to minimize build context, compress application assets, and remove unnecessary files.

### 9.2 Build Time Optimization

Faster builds improve developer productivity and CI/CD throughput. Techniques: order Dockerfile instructions by change frequency, use layer caching effectively, run independent RUN commands in parallel where possible, use BuildKit for improved build performance, and cache NuGet packages between builds.

### 9.3 Runtime Performance

Container runtime performance considerations: set appropriate resource requests and limits in Kubernetes, use the correct GC mode for .NET applications (Server GC for containerized workloads), configure thread pool sizes for the container's CPU limit, and minimize container startup time for faster scaling.

### 9.4 Base Image Selection

CloudMart uses mcr.microsoft.com/dotnet/aspnet:8.0-alpine for most services. This image is approximately 100 MB and contains only the .NET runtime, not the SDK. For services requiring additional libraries, the full Debian based runtime image (approximately 200 MB) is used.

### 9.5 DevOps Skills Learned

Image optimization teaches me performance tuning for containerized applications. These skills reduce infrastructure costs and improve scaling responsiveness.

---

## 10. Production Deployment

### 10.1 Image Registry Strategy

Azure Container Registry is the single source of truth for CloudMart images. The CI/CD pipeline pushes images to ACR. Kubernetes pulls images from ACR. Developers do not push images manually.

ACR uses geo replication to ensure images are available in all deployment regions. Access control uses managed identities: AKS has AcrPull permission, CI/CD has AcrPush permission.

### 10.2 Tagging for Production

Production deployments use immutable tags (Git commit SHA). The deployment manifest specifies the exact image digest. This ensures that the deployed image never changes unexpectedly. The latest tag is never used in production because it is mutable.

### 10.3 Deployment Patterns

Rolling updates replace pods gradually. Kubernetes creates new pods with the updated image, waits for them to be ready, then terminates old pods. This ensures zero downtime deployment.

Blue green deployment runs two identical environments. Traffic switches from blue to green when green is verified. This enables instant rollback.

Canary deployment routes a small percentage of traffic to the new version. If error rates and latency are acceptable, traffic gradually shifts to the new version.

CloudMart uses rolling updates for most services and canary deployment for the API Gateway.

### 10.4 Health Checks

Kubernetes uses health checks to determine pod readiness. The liveness probe detects stuck processes and restarts the container. The readiness probe determines if the pod should receive traffic.

CloudMart exposes three endpoints: /health/live for liveness (returns 200 if the process is running), /health/ready for readiness (returns 200 if dependencies are available), and /health/startup for slow starting containers.

### 10.5 Graceful Shutdown

When Kubernetes terminates a pod, it sends SIGTERM to the container. The application has a grace period (default 30 seconds) to complete in flight requests before SIGKILL is sent.

CloudMart configures ASP.NET Core to handle SIGTERM gracefully: the web server stops accepting new connections, in flight requests are allowed to complete, and the application exits cleanly. This prevents dropped requests during deployments and scaling events.

### 10.6 DevOps Skills Learned

Production deployment teaches me container lifecycle management, deployment patterns, health checking, and graceful shutdown. These skills ensure reliable production deployments.

---

## 11. Docker Compose

### 11.1 Local Development Setup

Docker Compose defines multi container applications in a single YAML file. For local development, CloudMart uses Docker Compose to run all services, databases, and infrastructure on a developer's machine.

The docker compose.yml file defines: all microservices with their Dockerfiles, a SQL Server container for local database, a Redis container for local caching, RabbitMQ or an in memory alternative for local messaging, and shared environment variables and network configuration.

### 11.2 Service Definitions

Each service in docker compose.yml specifies the build context, ports to expose, environment variables, volume mounts for hot reload during development, and dependencies on other services.

### 11.3 Network Configuration

Docker Compose creates a default network where services can reach each other by service name. The API Gateway reaches the Product Service at http://product-service:8080.

### 11.4 Volume Configuration

Source code volumes enable hot reload: changes on the host are immediately visible in the container. This eliminates the need to rebuild images during development.

### 11.5 DevOps Skills Learned

Docker Compose teaches me local development environment management, service orchestration for development, and the developer experience of containerized applications.

---

## 12. Troubleshooting

### 12.1 Common Issues

Common Docker issues include: container fails to start (check logs with docker logs), image build fails (check Dockerfile syntax and build context), network connectivity problems (verify network configuration and DNS), permission denied errors (check user permissions and file ownership), and out of memory errors (check resource limits and memory usage).

### 12.2 Debugging Commands

Essential Docker commands: docker ps shows running containers, docker logs shows container logs, docker exec runs commands inside a container, docker inspect shows detailed container configuration, docker stats shows resource usage, and docker system df shows disk usage.

### 12.3 Log Analysis

Container logs are the primary debugging tool. CloudMart uses structured JSON logging with correlation IDs. Logs are aggregated through Fluentd to Azure Log Analytics where they can be queried with KQL.

### 12.4 Performance Profiling

For performance issues, use docker stats to identify resource constraints. Use dotnet trace inside the container to capture .NET performance traces. Use dotnet counters to monitor GC, thread pool, and memory usage in real time.

### 12.5 DevOps Skills Learned

Troubleshooting teaches me systematic debugging methodology for containerized applications. These skills reduce mean time to resolution for production incidents.

---

## What I Have Accomplished in This Volume

This volume provided comprehensive documentation for Docker containerization of the CloudMart platform. I covered containerization fundamentals and the problems containers solve, Docker architecture including the daemon, containerd, runc, namespaces, and cgroups, Docker images with layered file systems and base image selection, Dockerfile design with layer caching and complete examples for each service, multi stage builds for image size optimization, Docker networking including drivers and service discovery, Docker storage with volumes, bind mounts, and persistent data patterns, container security including image scanning, runtime hardening, and network policies, image optimization techniques for size, build time, and runtime performance, production deployment patterns including rolling updates, canary deployments, and health checks, Docker Compose for local development, and troubleshooting methodology for common container issues.

**DevOps skills learned in this volume:** Container architecture, Dockerfile design, multi stage builds, image optimization, container security hardening, networking for containers, storage patterns, deployment patterns, and container troubleshooting.

**Interview questions this prepares me for:** How do containers differ from VMs? How do you optimize Docker image size? What is a multi stage build and why is it important? How do you secure containers in production? How do you handle container health checks? What happens during a rolling deployment? How do you debug a failing container?

**Real world engineering problem this solves:** Containerization is the standard for modern application deployment. Every company deploying to Kubernetes needs engineers who understand Docker deeply. This volume provides the knowledge to build, optimize, secure, and troubleshoot containerized applications in production.

**Azure services being mastered:** Azure Container Registry, Azure Container Instances (for troubleshooting), AKS container runtime integration.

**DevOps concepts being mastered:** Containerization, image optimization, security hardening, multi stage builds, health checks, graceful shutdown, rolling deployments, and container networking.

---

End of Volume 6