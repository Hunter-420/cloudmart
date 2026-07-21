# Volume 10: Security Architecture

## The Purpose of This Volume

This volume documents the comprehensive security architecture for the CloudMart platform. Security is not a feature that is added later. It is a foundational property of the system that must be designed into every layer from the beginning. The most secure systems are those where security is invisible to users but robust against attackers.

CloudMart handles customer personal data, payment information, and business transactions. A security breach would damage customer trust, violate regulations, and potentially cause financial loss. This volume explains how every component of the platform is secured.

---

## Detailed Table of Contents

1. Security Fundamentals
   1.1 The Security Mindset
   1.2 Defense in Depth
   1.3 Principle of Least Privilege
   1.4 Zero Trust Architecture
   1.5 DevOps Skills Learned

2. Threat Modeling
   2.1 STRIDE Methodology
   2.2 CloudMart Threat Model
   2.3 Attack Surface Analysis
   2.4 Mitigation Strategies
   2.5 DevOps Skills Learned

3. Authentication
   3.1 Customer Authentication with Azure AD B2C
   3.2 JWT Token Design
   3.3 Token Lifecycle Management
   3.4 Multi Factor Authentication
   3.5 Password Policies
   3.6 DevOps Skills Learned

4. Authorization
   4.1 Role Based Access Control
   4.2 Resource Level Permissions
   4.3 Claims Based Authorization
   4.4 Policy Enforcement
   4.5 DevOps Skills Learned

5. Secrets Management
   5.1 Azure Key Vault Architecture
   5.2 Secret Lifecycle
   5.3 Managed Identities
   5.4 Certificate Management
   5.5 Rotation Policies
   5.6 DevOps Skills Learned

6. Encryption
   6.1 Encryption at Rest
   6.2 Encryption in Transit
   6.3 Certificate Management
   6.4 Key Management
   6.5 DevOps Skills Learned

7. Network Security
   7.1 Network Segmentation
   7.2 Firewall Rules
   7.3 Private Endpoints
   7.4 DDoS Protection
   7.5 WAF Configuration
   7.6 DevOps Skills Learned

8. Container Security
   8.1 Image Hardening
   8.2 Runtime Security
   8.3 Pod Security Standards
   8.4 Network Policies
   8.5 DevOps Skills Learned

9. Kubernetes Security
   9.1 Cluster Security
   9.2 RBAC Design
   9.3 Admission Controllers
   9.4 etcd Security
   9.5 DevOps Skills Learned

10. Supply Chain Security
    10.1 Dependency Management
    10.2 Image Provenance
    10.3 SLSA Framework
    10.4 SBOM Generation
    10.5 DevOps Skills Learned

11. CI/CD Security
    11.1 Pipeline Security
    11.2 Secret Scanning
    11.3 SAST and DAST
    11.4 Infrastructure Scanning
    11.5 DevOps Skills Learned

12. Compliance
    12.1 GDPR Considerations
    12.2 PCI DSS Scope Reduction
    12.3 SOC 2 Controls
    12.4 Audit Logging
    12.5 DevOps Skills Learned

13. Incident Response
    13.1 Security Incident Classification
    13.2 Detection and Alerting
    13.3 Containment Procedures
    13.4 Forensic Analysis
    13.5 DevOps Skills Learned

14. Security Checklist
    14.1 Infrastructure Security
    14.2 Application Security
    14.3 Operational Security
    14.4 DevOps Skills Learned

---

## 1. Security Fundamentals

### 1.1 The Security Mindset

Security is not about achieving perfect protection. It is about raising the cost of attack above the value of the target. An attacker with unlimited resources and unlimited time can breach any system. The goal is to make the attack so expensive, so difficult, and so time consuming that rational attackers move on to easier targets.

This mindset shapes every decision: assume breach (design as if attackers are already inside), minimize blast radius (contain the damage if a component is compromised), and never trust, always verify (every request, every connection, every user is untrusted until proven otherwise).

### 1.2 Defense in Depth

Defense in depth layers security controls so that if one fails, others provide protection. CloudMart implements defense in depth across multiple layers: perimeter (WAF, DDoS protection), network (NSGs, private endpoints, network policies), application (authentication, authorization, input validation), data (encryption at rest and in transit), and identity (RBAC, managed identities).

An attacker who bypasses the WAF still faces network segmentation. An attacker who reaches the network still needs valid credentials. An attacker who compromises a container still cannot access data without encryption keys. Each layer adds friction and detection opportunity.

### 1.3 Principle of Least Privilege

Every component and user should have the minimum permissions needed for their function. The API Gateway needs to read configuration and route requests. It does not need to modify databases. The Product Service needs to read product data. It does not need to access payment information.

CloudMart implements least privilege through: RBAC with granular roles, managed identities with scoped permissions, network policies restricting pod communication, and database permissions limited to required operations.

### 1.4 Zero Trust Architecture

Zero Trust assumes no trust based on network location. A request from inside the corporate network is treated with the same skepticism as a request from the internet. Every access request is authenticated, authorized, and encrypted.

CloudMart implements Zero Trust: all service to service communication uses authenticated managed identities, network policies restrict pod to pod traffic regardless of namespace, private endpoints eliminate public internet exposure for data services, and every API request requires valid JWT tokens.

### 1.5 DevOps Skills Learned

Security fundamentals teach me the mindset and principles that guide secure system design. These principles are universal across technologies and organizations.

---

## 2. Threat Modeling

### 2.1 STRIDE Methodology

STRIDE is a threat classification framework: Spoofing (impersonating someone else), Tampering (modifying data or code), Repudiation (denying having performed an action), Information Disclosure (exposing information to unauthorized parties), Denial of Service (making the system unavailable), and Elevation of Privilege (gaining unauthorized capabilities).

For each component, we ask: how could an attacker perform each STRIDE attack? What mitigations exist? What additional mitigations are needed?

### 2.2 CloudMart Threat Model

Key threats identified: an attacker could steal customer credentials through phishing and purchase goods, an attacker could exploit a vulnerable dependency to gain container access, an insider could exfiltrate customer data, a DDoS attack could overwhelm the API Gateway, and a supply chain attack could compromise the container image build process.

### 2.3 Attack Surface Analysis

The attack surface includes: public endpoints (API Gateway, admin dashboard), third party integrations (Stripe, SendGrid, Twilio), container images, CI/CD pipeline, Terraform state, Kubernetes API, and developer workstations.

### 2.4 Mitigation Strategies

For each threat: credential theft is mitigated by MFA and password policies, container compromise is mitigated by image scanning and runtime security, data exfiltration is mitigated by encryption and access controls, DDoS is mitigated by WAF and rate limiting, and supply chain attacks are mitigated by dependency scanning and image signing.

### 2.5 DevOps Skills Learned

Threat modeling teaches me systematic security analysis, attack surface identification, and risk based mitigation prioritization.

---

## 3. Authentication

### 3.1 Customer Authentication with Azure AD B2C

Azure AD B2C handles customer identity. Customers register with email and password. B2C enforces password complexity, rate limits login attempts, and supports MFA. The application never handles passwords. B2C returns JWT tokens that the application validates.

### 3.2 JWT Token Design

Access tokens are JWTs signed with RS256 (RSA with SHA256). The signing keys are managed by B2C and rotated automatically. Token contents: sub (user ID), email, name, roles (application specific), iss (issuer), aud (audience), exp (expiration), and iat (issued at).

### 3.3 Token Lifecycle Management

Access tokens expire after 15 minutes. Refresh tokens expire after 7 days with sliding expiration. Tokens are validated on every request: signature verification, expiration check, issuer validation, and audience validation. Logout adds the token to a Redis blocklist for the remaining token lifetime.

### 3.4 Multi Factor Authentication

MFA is available for customer accounts. Customers can enable authenticator app based MFA. Admin accounts require MFA. Implementation uses B2C custom policies for the MFA challenge flow.

### 3.5 Password Policies

Minimum 8 characters, require uppercase, lowercase, digit, and special character, check against known breached passwords using Have I Been Pwned API, enforce password history (cannot reuse last 5 passwords), and account lockout after 5 failed attempts.

### 3.6 DevOps Skills Learned

Authentication design teaches me modern identity patterns, token security, and MFA implementation. These skills are essential for any customer facing application.

---

## 4. Authorization

### 4.1 Role Based Access Control

CloudMart defines roles: Customer (browse, purchase, manage profile), Admin (all customer actions plus product management, order management, analytics), Product Manager (product CRUD, inventory), Order Processor (view and update orders), and Analyst (read only analytics access).

Roles are stored in the database and included in JWT claims. The API Gateway validates roles against endpoint requirements.

### 4.2 Resource Level Permissions

Users can only access their own resources. Customers can only view their own orders and profile data. This is enforced at the database query level by filtering on user ID from the JWT token.

### 4.3 Claims Based Authorization

.NET authorization policies check claims: [Authorize(Policy = "Admin")] requires the Admin role claim. Policies are defined in Program.cs and can combine multiple requirements.

### 4.4 Policy Enforcement

Authorization is enforced at multiple layers: API Gateway validates JWT and extracts claims, controllers use Authorize attributes, service methods verify ownership, and database queries filter by user ID. Defense in depth ensures that a failure at one layer does not expose unauthorized data.

### 4.5 DevOps Skills Learned

Authorization design teaches me access control patterns, defense in depth for authorization, and claims based security.

---

## 5. Secrets Management

### 5.1 Azure Key Vault Architecture

Azure Key Vault is the central secret store. Three types of objects: Secrets (API keys, connection strings), Keys (encryption keys for application level encryption), and Certificates (TLS certificates, code signing certificates).

CloudMart uses a Key Vault per environment. Production secrets are never copied to development environments. Access is logged to Azure Monitor.

### 5.2 Secret Lifecycle

Secrets follow a lifecycle: creation in Key Vault (never in code), distribution through managed identities (never through environment variables), usage through runtime retrieval, rotation on schedule or after compromise, and deletion with soft delete protection.

### 5.3 Managed Identities

Managed identities eliminate the need to store credentials for Azure service access. The AKS cluster uses a system assigned managed identity. This identity has RBAC permissions to read secrets from Key Vault. Pods authenticate automatically through the Azure Instance Metadata Service.

### 5.4 Certificate Management

TLS certificates for the Application Gateway are stored in Key Vault. cert-manager integrates with Key Vault through the CSI driver to provision and renew certificates automatically from Let's Encrypt.

### 5.5 Rotation Policies

Secrets rotate on these schedules: database passwords every 90 days, API keys for third party services every 180 days, TLS certificates automatically renewed 30 days before expiry, and signing keys rotated annually.

### 5.6 DevOps Skills Learned

Secrets management teaches me centralized credential management, automatic authentication, certificate lifecycle management, and rotation policies.

---

## 6. Encryption

### 6.1 Encryption at Rest

All data is encrypted at rest: Azure SQL Database uses Transparent Data Encryption (AES 256), Azure Blob Storage uses SSE (AES 256), Azure Managed Disks use platform managed keys, and Redis Cache uses Azure managed encryption.

Sensitive columns in the database (customer phone numbers) use Always Encrypted with column encryption keys stored in Key Vault. The application sends plaintext to the client driver which encrypts before sending to the database. Even database administrators cannot read the plaintext.

### 6.2 Encryption in Transit

All network traffic is encrypted: TLS 1.2 or higher for all HTTP traffic, mTLS between ingress controller and pods (service mesh future enhancement), SSL for database connections, and encrypted Service Bus communication.

### 6.3 Certificate Management

Certificates are managed through: Let's Encrypt for public TLS certificates (free, automatic renewal), Azure Key Vault for certificate storage, and cert-manager for automatic certificate provisioning and renewal in Kubernetes.

### 6.4 Key Management

Encryption keys are managed through: Azure Key Vault for application keys, Azure managed keys for platform encryption (TDE, SSE), and customer managed keys for sensitive data (Always Encrypted).

### 6.5 DevOps Skills Learned

Encryption architecture teaches me data protection strategies, certificate management, and key lifecycle management. These skills are essential for compliance and data protection.

---

## 7. Network Security

### 7.1 Network Segmentation

The VNET is segmented into subnets: GatewaySubnet for Application Gateway, AKS subnet for Kubernetes nodes, DB subnet for database private endpoints, Integration subnet for service private endpoints, and Bastion subnet for management access.

Each subnet has a Network Security Group controlling traffic flow. The DB subnet accepts connections only from the AKS subnet. The AKS subnet accepts inbound connections only from the gateway and bastion subnets.

### 7.2 Firewall Rules

NSG rules are explicit and default deny: allow HTTPS from Internet to GatewaySubnet, allow HTTP/HTTPS from GatewaySubnet to AKS subnet, allow SQL and Redis from AKS subnet to DB subnet, allow HTTPS outbound from AKS subnet for external APIs, and deny all other traffic.

### 7.3 Private Endpoints

Private endpoints provide private IP addresses for Azure PaaS services. Traffic between AKS and SQL Database flows entirely over the Azure backbone network, never touching the public internet. DNS records are overridden to resolve to private IPs.

### 7.4 DDoS Protection

Azure DDoS Protection Basic is included with all Azure resources. It protects against common network layer attacks. For additional protection, DDoS Protection Standard provides advanced mitigation for volumetric attacks.

### 7.5 WAF Configuration

The Web Application Firewall on Application Gateway operates in Prevention mode with OWASP 3.2 core rule set. Custom rules block known malicious IPs. Request size limits prevent large payload attacks.

### 7.6 DevOps Skills Learned

Network security teaches me segmentation strategies, firewall design, private connectivity, and edge protection. These skills are essential for infrastructure security.

---

## 8. Container Security

### 8.1 Image Hardening

Base images are minimal: Alpine Linux or distroless. No unnecessary tools (no curl, no ssh, no package manager in runtime). Images are rebuilt weekly to incorporate security patches. Only approved base images from Microsoft Container Registry are used.

### 8.2 Runtime Security

Containers run as non root users. The root file system is read only. All Linux capabilities are dropped. Resource limits prevent container escape through resource exhaustion. Seccomp profiles restrict available system calls.

### 8.3 Pod Security Standards

The Restricted security standard is enforced on all application namespaces. This prevents: privileged containers, privilege escalation, root user execution, writable root file systems, and unrestricted capabilities.

### 8.4 Network Policies

Default deny network policies block all pod to pod traffic. Explicit allow policies permit only required communication. The API Gateway can reach backend services. Backend services can reach databases and Redis. Nothing else is allowed.

### 8.5 DevOps Skills Learned

Container security teaches me image hardening, runtime protection, and Kubernetes security policies. These skills are essential for secure container deployments.

---

## 9. Kubernetes Security

### 9.1 Cluster Security

AKS security features: Azure AD integration for cluster authentication, RBAC enabled for authorization, private clusters (API server accessible only through private network), and API server authorized IP ranges.

### 9.2 RBAC Design

Roles are scoped to namespaces. The cloudmart namespace has roles for: application service accounts (read configmaps, read secrets from Key Vault CSI), ingress controller (read services, endpoints, ingresses), and cert-manager (create secrets for certificates).

### 9.3 Admission Controllers

Admission controllers validate and mutate requests to the API server. Azure Policy for AKS enforces policies: allowed container registries (only ACR), required resource limits, prohibited privileged containers, and required labels.

### 9.4 etcd Security

With AKS, etcd is managed by Azure and encrypted at rest. Backups are encrypted and access controlled. etcd does not need direct management in AKS.

### 9.5 DevOps Skills Learned

Kubernetes security teaches me cluster hardening, RBAC design, admission control, and managed Kubernetes security features.

---

## 10. Supply Chain Security

### 10.1 Dependency Management

Dependencies are pinned to specific versions in lock files. Dependabot alerts on known vulnerabilities. Dependency updates are tested in CI before merge.

### 10.2 Image Provenance

Container images are signed using notation or cosign. Kubernetes verifies signatures before deployment. This ensures only images built by the CI/CD pipeline can run in production.

### 10.3 SLSA Framework

SLSA (Supply chain Levels for Software Artifacts) defines levels of supply chain security. CloudMart targets SLSA Level 2: build service generates signed provenance, and builds run on hosted build service (GitHub Actions).

### 10.4 SBOM Generation

Software Bill of Materials lists all components in an application. Syft generates SBOMs for container images listing OS packages, libraries, and their versions. SBOMs are stored with each release for vulnerability tracking.

### 10.5 DevOps Skills Learned

Supply chain security teaches me dependency management, image signing, provenance tracking, and SBOM generation. These skills are increasingly important for enterprise security.

---

## 11. CI/CD Security

### 11.1 Pipeline Security

GitHub Actions security: OIDC authentication to Azure (no stored credentials), least privilege workflow permissions, branch protection on main, required status checks, and no secrets in workflow outputs.

### 11.2 Secret Scanning
gitleaks scans every commit for exposed secrets. Pre commit hooks run gitleaks locally. GitHub Advanced Security scans the entire repository history.

### 11.3 SAST and DAST

SAST (Static Application Security Testing) with CodeQL analyzes source code for vulnerabilities. DAST (Dynamic Application Security Testing) with OWASP ZAP scans running applications. Both run in CI/CD pipelines.

### 11.4 Infrastructure Scanning
checkov scans Terraform configurations for security misconfigurations. Trivy scans container images. Results are posted as PR comments and block merge for critical findings.

### 11.5 DevOps Skills Learned

CI/CD security teaches me DevSecOps practices, automated security testing, and secure pipeline design. These skills implement shift left security.

---

## 12. Compliance

### 12.1 GDPR Considerations

CloudMart implements GDPR requirements: data minimization (collect only necessary data), purpose limitation (use data only for stated purposes), storage limitation (retain only as long as needed), right to access (provide customer data on request), right to erasure (delete customer data within 30 days), and data portability (export data in standard format).

### 12.2 PCI DSS Scope Reduction

Payment Card Industry Data Security Standard requirements are met by scope reduction: CloudMart never stores, processes, or transmits card data. Stripe handles all card data through Stripe Elements and PCI compliant APIs. CloudMart completes PCI SAQ A (the simplest assessment) annually.

### 12.3 SOC 2 Controls

SOC 2 Trust Service Criteria are addressed: Security (access controls, encryption, monitoring), Availability (redundancy, backups, disaster recovery), and Confidentiality (data classification, access restrictions). Audit logs capture all data access for compliance review.

### 12.4 Audit Logging

All data access is logged: who accessed what, when, from where, and what action was performed. Logs are immutable (write once, read many) and retained for 1 year. Log queries enable compliance reporting and incident investigation.

### 12.5 DevOps Skills Learned

Compliance architecture teaches me regulatory requirements, audit procedures, and control implementation for regulated industries.

---

## 13. Incident Response

### 13.1 Security Incident Classification

Class 1: confirmed data breach or unauthorized access to production. Class 2: vulnerability exploited in non production. Class 3: vulnerability discovered but not exploited. Class 4: policy violation or suspicious activity.

### 13.2 Detection and Alerting

Security alerts: multiple failed logins from single IP (brute force), unusual data access patterns (possible exfiltration), privilege escalation attempts, and container escape attempts. Alerts route to the security team through PagerDuty.

### 13.3 Containment Procedures

For a compromised container: isolate the pod (remove from service), capture forensic data (logs, memory dump if possible), revoke any compromised credentials, and replace the container with a clean instance.

### 13.4 Forensic Analysis

Preserve evidence before it is lost: capture pod logs, export relevant metrics, identify the attack vector (which vulnerability was exploited), determine scope (what was accessed or modified), and document the timeline.

### 13.5 DevOps Skills Learned

Security incident response teaches me containment procedures, forensic preservation, and security crisis management.

---

## 14. Security Checklist

### 14.1 Infrastructure Security

Network segmentation with private endpoints, NSGs with default deny, WAF in prevention mode, DDoS protection enabled, encryption at rest for all data stores, encryption in transit for all communication, managed identities for Azure service access, Key Vault for secret management, and RBAC with least privilege.

### 14.2 Application Security

Input validation on all endpoints, parameterized queries (no SQL injection), output encoding (prevent XSS), CSRF protection, secure cookie attributes, JWT token validation, rate limiting, and dependency vulnerability scanning.

### 14.3 Operational Security

Container images scanned before deployment, runtime security policies enforced, CI/CD pipeline secured with OIDC, audit logging enabled, access reviews conducted quarterly, security training for all engineers, and incident response procedures documented.

### 14.4 DevOps Skills Learned

The security checklist provides a comprehensive framework for evaluating and implementing security across infrastructure, application, and operational layers.

---

## What I Have Accomplished in This Volume

This volume documented the complete security architecture for CloudMart. I covered security fundamentals with defense in depth and zero trust, threat modeling using STRIDE, authentication with Azure AD B2C and JWT design, authorization with RBAC and claims based security, secrets management with Key Vault and managed identities, encryption at rest and in transit, network security with segmentation and private endpoints, container security with hardening and runtime protection, Kubernetes security with RBAC and admission control, supply chain security with SLSA and SBOMs, CI/CD security with DevSecOps practices, compliance with GDPR and PCI DSS, and security incident response procedures.

**DevOps skills learned in this volume:** Security architecture, threat modeling, identity and access management, encryption design, network security, container security, Kubernetes security, supply chain security, DevSecOps, and compliance management.

**Interview questions this prepares me for:** How do you implement defense in depth? What is zero trust architecture? How do you manage secrets in Kubernetes? How do you secure container images? What is the difference between authentication and authorization? How do you reduce PCI DSS scope? How do you respond to a security incident? What are pod security standards?

**Real world engineering problem this solves:** Security breaches cost organizations millions and damage customer trust. This volume documents the comprehensive security practices that protect CloudMart against common attack vectors and ensure compliance with industry regulations.

**Azure services being mastered:** Azure AD B2C, Azure Key Vault, Azure Private Link, Azure DDoS Protection, Application Gateway WAF, Azure Policy.

**DevOps concepts being mastered:** Defense in depth, zero trust, identity management, encryption, network segmentation, container security, DevSecOps, and compliance automation.

---

End of Volume 10