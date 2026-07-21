# Volume 5: Terraform Infrastructure as Code Architecture

## The Purpose of This Volume

This volume documents the complete Terraform architecture for provisioning the CloudMart platform on Azure. Infrastructure as Code is the practice of defining infrastructure through machine readable definition files rather than manual configuration. Terraform, created by HashiCorp, is the most widely adopted IaC tool across cloud platforms.

Understanding Terraform deeply is essential for several reasons. First, manual infrastructure creation is error prone and not reproducible. When I need to recreate the development environment, Terraform does it consistently. Second, infrastructure changes can be reviewed like code through pull requests. Third, Terraform state provides a single source of truth for what exists. Fourth, Terraform modules enable reuse and standardization across environments.

This volume explains not just how to write Terraform configurations but how to architect them for enterprise scale: folder structure, module design, state management, security, collaboration, and best practices.

---

## Detailed Table of Contents

1. Terraform Fundamentals
   1.1 What Terraform Is and Why It Exists
   1.2 How Terraform Works Internally
   1.3 The Terraform Workflow
   1.4 HCL Language Basics
   1.5 Terraform vs Alternatives
   1.6 DevOps Skills Learned

2. Project Folder Structure
   2.1 Root Structure
   2.2 Environment Organization
   2.3 Module Structure
   2.4 File Naming Conventions
   2.5 DevOps Skills Learned

3. Module Architecture
   3.1 Module Design Principles
   3.2 Root Module
   3.3 Child Modules
   3.4 Module Composition
   3.5 Module Registry
   3.6 DevOps Skills Learned

4. Variables and Inputs
   4.1 Variable Types
   4.2 Variable Definitions
   4.3 Variable Validation
   4.4 Sensitive Variables
   4.5 Variable Precedence
   4.6 DevOps Skills Learned

5. Outputs
   5.1 Output Definitions
   5.2 Output Values
   5.3 Sensitive Outputs
   5.4 Cross Module Dependencies
   5.5 DevOps Skills Learned

6. State Management
   6.1 What State Is and Why It Matters
   6.2 Local State
   6.3 Remote State
   6.4 State Locking
   6.5 State Security
   6.6 State Workflows
   6.7 DevOps Skills Learned

7. Backend Configuration
   7.1 Backend Types
   7.2 Azure Blob Storage Backend
   7.3 Backend Initialization
   7.4 Partial Configuration
   7.5 DevOps Skills Learned

8. Workspaces and Environments
   8.1 Workspace Concept
   8.2 Environment Isolation
   8.3 Workspace Commands
   8.4 Alternatives to Workspaces
   8.5 DevOps Skills Learned

9. Resource Definitions
   9.1 Azure Provider Configuration
   9.2 Resource Syntax
   9.3 Resource Dependencies
   9.4 Resource Lifecycle
   9.5 Data Sources
   9.6 DevOps Skills Learned

10. Naming Conventions
    10.1 Resource Naming Strategy
    10.2 Tagging Strategy
    10.3 Consistency Rules
    10.4 DevOps Skills Learned

11. Security Practices
    11.1 Secret Management
    11.2 State Encryption
    11.3 Least Privilege
    11.4 Audit Logging
    11.5 DevOps Skills Learned

12. Execution Flow
    12.1 Init Command
    12.2 Plan Command
    12.3 Apply Command
    12.4 Destroy Command
    12.5 Refresh and Import
    12.6 DevOps Skills Learned

13. Dependency Graph
    13.1 Implicit Dependencies
    13.2 Explicit Dependencies
    13.3 Graph Visualization
    13.4 Dependency Best Practices
    13.5 DevOps Skills Learned

14. Best Practices
    14.1 Code Organization
    14.2 Documentation
    14.3 Testing Strategies
    14.4 Version Pinning
    14.5 Error Handling
    14.6 DevOps Skills Learned

15. Common Mistakes
    15.1 State Conflicts
    15.2 Circular Dependencies
    15.3 Hardcoded Values
    15.4 Missing Constraints
    15.5 Security Oversights
    15.6 DevOps Skills Learned

16. Enterprise Patterns
    16.1 GitOps Integration
    16.2 CI/CD Pipeline Integration
    16.3 Policy as Code
    16.4 Drift Detection
    16.5 DevOps Skills Learned

17. Complete Terraform Configuration Reference
    17.1 Networking Module
    17.2 AKS Module
    17.3 Database Module
    17.4 Cache Module
    17.5 Service Bus Module
    17.6 Key Vault Module
    17.7 Application Gateway Module
    17.8 Monitoring Module
    17.9 DevOps Skills Learned

---

## 1. Terraform Fundamentals

### 1.1 What Terraform Is and Why It Exists

Before Infrastructure as Code, creating infrastructure meant logging into cloud portals, clicking through wizards, copying configuration values between screens, and hoping you did not miss a step. This process was slow, inconsistent, and terrifying to reproduce. If a disaster destroyed your infrastructure, rebuilding from memory or documentation was unreliable. If a new engineer needed an environment, they required hours of guidance from someone who had done it before.

Terraform solves these problems by letting you define infrastructure in text files using a declarative language. You describe what you want: a virtual network with this address space, a Kubernetes cluster with these node pools, a SQL database with this tier. Terraform figures out how to create it. If the infrastructure already exists, Terraform makes no changes. If something is missing or different, Terraform creates or updates it.

This declarative approach is powerful because your configuration files become both documentation and executable specification. They can be version controlled, peer reviewed, tested, and automated.

### 1.2 How Terraform Works Internally

Terraform has three internal components: the core, providers, and state.

The core is a single binary written in Go. It parses configuration files, builds a dependency graph, and orchestrates the execution plan. The core itself knows nothing about Azure, AWS, or any specific cloud. It provides the engine for parsing HCL, evaluating expressions, managing state, and executing plans.

Providers are plugins that implement resource types for specific platforms. The Azure provider translates Terraform resource definitions into Azure REST API calls. When you define an azurerm_kubernetes_cluster resource, the provider knows how to create that resource by calling the Azure Container Service API with the right parameters. Providers are distributed through the Terraform Registry and are installed automatically when you run terraform init.

State is a JSON file that maps your configuration resources to real world resources. When you create an azurerm_resource_group named "main", Terraform records the Azure resource ID in state. On subsequent runs, Terraform uses this mapping to determine whether the resource exists and whether it matches your configuration. Without state, Terraform would not know which resources it manages and would try to create everything on every run.

### 1.3 The Terraform Workflow

The standard Terraform workflow has four commands.

Init initializes the working directory. It downloads providers, modules, and configures the backend. You run init after cloning a repository or after adding new providers or modules.

Plan compares your configuration to the current state and creates an execution plan. The plan shows what Terraform will create, modify, or destroy. Reviewing the plan before applying is critical because it reveals unintended changes.

Apply executes the plan. Terraform makes the actual API calls to create, update, or delete resources. Apply can be interactive (prompting for confirmation) or automated (with auto approve flag).

Destroy removes all resources defined in the configuration. This is useful for cleaning up development environments. In production, destroy is rarely used; instead, resources are removed by deleting their configuration and running apply.

### 1.4 HCL Language Basics

HashiCorp Configuration Language is Terraform's native language. It is declarative, not imperative. You describe desired state rather than steps to achieve it.

HCL uses blocks, arguments, and expressions. Blocks define resources, modules, variables, and other constructs. Arguments assign values to names. Expressions compute values using variables, functions, and operators.

A resource block defines an infrastructure object: resource "azurerm_resource_group" "main" creates an Azure resource group. The first string is the resource type, the second is the name used to reference this resource within Terraform.

Variables make configurations reusable: variable "environment" lets you specify different values for dev, staging, and production. Outputs expose values: output "resource_group_name" makes the created resource group name available to other modules or for reference.

### 1.5 Terraform vs Alternatives

Azure Resource Manager templates are Azure's native IaC format. They use JSON which is verbose and error prone. ARM templates are Azure only with no portability. Bicep improves the syntax but remains Azure specific.

Pulumi allows writing infrastructure code in general purpose programming languages like TypeScript and Python. This is appealing to software engineers but has smaller community and ecosystem compared to Terraform.

AWS CloudFormation is AWS native and not applicable for Azure deployments. Its limitations are similar to ARM templates.

Terraform is the best choice for CloudMart because it is cloud agnostic (skills transfer to other clouds), has the largest module ecosystem, uses a purpose built language for infrastructure, has massive community adoption, and integrates with Azure through a first class provider.

### 1.6 DevOps Skills Learned

Terraform fundamentals teach me the core concepts of infrastructure as code: declarative configuration, state management, provider architecture, and the plan/apply workflow. These concepts transfer to any IaC tool.

---

## 2. Project Folder Structure

### 2.1 Root Structure

The CloudMart Terraform project follows a hierarchical structure that separates environments, modules, and configuration. This structure enables reuse, collaboration, and environment isolation.

```
terraform/
├── README.md
├── backend.tf                    # Backend configuration
├── providers.tf                  # Provider versions and configuration
├── variables.tf                  # Global variables
├── outputs.tf                    # Global outputs
├── versions.tf                   # Terraform and provider version constraints
│
├── environments/
│   ├── dev/
│   │   ├── main.tf              # Dev environment composition
│   │   ├── variables.tf         # Dev specific variables
│   │   ├── outputs.tf           # Dev outputs
│   │   ├── backend.tfvars       # Dev backend config
│   │   └── terraform.tfvars     # Dev variable values
│   │
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── backend.tfvars
│   │   └── terraform.tfvars
│   │
│   └── production/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── backend.tfvars
│       └── terraform.tfvars
│
└── modules/
    ├── networking/
    │   ├── main.tf
    │   ├── variables.tf
    │   ├── outputs.tf
    │   └── README.md
    ├── aks/
    │   ├── main.tf
    │   ├── variables.tf
    │   ├── outputs.tf
    │   └── README.md
    ├── database/
    │   ├── main.tf
    │   ├── variables.tf
    │   ├── outputs.tf
    │   └── README.md
    ├── cache/
    │   ├── main.tf
    │   ├── variables.tf
    │   ├── outputs.tf
    │   └── README.md
    ├── servicebus/
    │   ├── main.tf
    │   ├── variables.tf
    │   ├── outputs.tf
    │   └── README.md
    ├── keyvault/
    │   ├── main.tf
    │   ├── variables.tf
    │   ├── outputs.tf
    │   └── README.md
    ├── appgateway/
    │   ├── main.tf
    │   ├── variables.tf
    │   ├── outputs.tf
    │   └── README.md
    └── monitoring/
        ├── main.tf
        ├── variables.tf
        ├── outputs.tf
        └── README.md
```

### 2.2 Environment Organization

Each environment directory is a self contained Terraform configuration. The dev, staging, and production environments are independent. They share modules but have separate state files, variable values, and backend configurations.

This separation ensures that changes to one environment do not affect others. A developer experimenting in dev cannot accidentally modify production. State files are isolated, so operations in dev do not lock the production state.

### 2.3 Module Structure

Each module follows a standard layout: main.tf contains the resource definitions, variables.tf declares input variables, outputs.tf declares output values, and README.md documents usage. This structure is the community standard, making modules familiar to other Terraform users.

### 2.4 File Naming Conventions

Files are named by purpose: main.tf for primary resources, variables.tf for inputs, outputs.tf for outputs, versions.tf for constraints, backend.tf for state configuration, and terraform.tfvars for variable values. This naming convention is widely recognized and supported by tooling.

### 2.5 DevOps Skills Learned

Folder structure design teaches me code organization for infrastructure at scale. This structure supports team collaboration, environment isolation, module reuse, and change management through pull requests.

---

## 3. Module Architecture

### 3.1 Module Design Principles

Modules are the primary mechanism for code reuse in Terraform. A module is a self contained collection of Terraform configurations that manages a specific infrastructure component. Good modules are composable, documented, and tested.

The key design principles: single responsibility (each module manages one thing), clear interface (well defined variables and outputs), sensible defaults (works out of the box with minimal configuration), and documentation (README with usage examples).

### 3.2 Root Module

The root module is the top level configuration that Terraform executes. For CloudMart, each environment directory is a root module. The root module calls child modules and passes configuration values through variables.

The production root module might call the networking module with a /16 address space, the AKS module with 3 node pools, and the database module with Business Critical tier. The development root module calls the same modules with smaller configurations.

### 3.3 Child Modules

Child modules are reusable components called by root modules. CloudMart modules include: networking creates the VNET, subnets, NSGs, and route tables; aks creates the Kubernetes cluster with configured node pools; database creates SQL servers and databases; cache creates Redis instances; servicebus creates namespaces, topics, and queues; keyvault creates vaults with access policies; appgateway creates the application gateway with WAF; and monitoring creates Log Analytics workspace, Application Insights, and alert rules.

### 3.4 Module Composition

Root modules compose child modules into complete environments. The production main.tf calls modules in dependency order:

```hcl
module "networking" {
  source              = "../../modules/networking"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  vnet_address_space  = var.vnet_address_space
  subnets             = var.subnets
}

module "aks" {
  source              = "../../modules/aks"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  vnet_subnet_id      = module.networking.aks_subnet_id
  node_pools          = var.node_pools
  depends_on          = [module.networking]
}
```

The explicit depends_on ensures networking is created before AKS because AKS references the subnet ID as an output from the networking module.

### 3.5 Module Registry

While CloudMart uses local modules (referenced by relative path), Terraform supports module registries for sharing modules across teams and organizations. The Terraform Public Registry contains thousands of pre built modules. Terraform Cloud and Enterprise provide private registries for organizational modules.

For future growth, CloudMart modules could be published to a private registry, enabling other teams to consume them without copying code.

### 3.6 DevOps Skills Learned

Module architecture teaches me software engineering principles applied to infrastructure: separation of concerns, interface design, composition, and reuse. These skills enable me to build maintainable infrastructure codebases.

---

## 4. Variables and Inputs

### 4.1 Variable Types

Terraform supports several variable types: string for text values like resource names, number for numeric values like node counts, bool for true/false flags like encryption enabled, list for ordered collections like allowed IPs, set for unordered unique collections, map for key value pairs like tags, and object for structured data with typed fields.

CloudMart uses objects extensively for complex inputs like node pool configurations:

```hcl
variable "node_pools" {
  type = map(object({
    vm_size      = string
    min_count    = number
    max_count    = number
    node_taints  = list(string)
    node_labels  = map(string)
  }))
}
```

### 4.2 Variable Definitions

Variables are declared in variables.tf files. Each variable has a type, description, and optional default value:

```hcl
variable "environment" {
  type        = string
  description = "Environment name: dev, staging, or production"
}

variable "location" {
  type        = string
  description = "Azure region for resources"
  default     = "westus2"
}
```

Variables without defaults are required. Terraform prompts for their value if not provided through tfvars files or command line arguments.

### 4.3 Variable Validation

Validation rules ensure variables meet constraints before Terraform attempts to create resources:

```hcl
variable "environment" {
  type        = string
  description = "Environment name"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "aks_node_count" {
  type        = number
  description = "Number of AKS nodes"

  validation {
    condition     = var.aks_node_count >= 1 && var.aks_node_count <= 50
    error_message = "Node count must be between 1 and 50."
  }
}
```

Validation catches configuration errors early, before expensive resource creation begins.

### 4.4 Sensitive Variables

Sensitive variables prevent values from appearing in plan output and logs:

```hcl
variable "sql_admin_password" {
  type        = string
  description = "SQL Server admin password"
  sensitive   = true
}
```

However, sensitive only affects Terraform output. The value is still stored in state. For true secret management, use Azure Key Vault and reference secrets through data sources rather than passing them as variables.

### 4.5 Variable Precedence

Terraform resolves variable values in this order, highest to lowest: command line flags like var, tfvars files specified on command line, terraform.tfvars or terraform.tfvars.json, environment variables starting with TF_VAR_, and default values in variable declarations.

For CloudMart, common variables are set in terraform.tfvars files per environment. Sensitive values like passwords are passed through environment variables in CI/CD pipelines.

### 4.6 DevOps Skills Learned

Variable management teaches me configuration management, input validation, and secret handling. These skills ensure infrastructure is configurable, robust, and secure.

---

## 5. Outputs

### 5.1 Output Definitions

Outputs expose values from modules so other modules or external tools can use them:

```hcl
output "aks_cluster_name" {
  description = "Name of the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.name
}

output "aks_kube_config" {
  description = "Kubernetes configuration for kubectl"
  value       = azurerm_kubernetes_cluster.main.kube_config_raw
  sensitive   = true
}
```

### 5.2 Output Values

Output values are computed after apply completes. They can reference resource attributes, computed values, and expressions. The networking module outputs subnet IDs that the AKS module consumes as inputs.

### 5.3 Sensitive Outputs

Sensitive outputs are redacted from plan and state output but are still stored in state:

```hcl
output "sql_connection_string" {
  description = "SQL Database connection string"
  value       = "Server=tcp:${azurerm_mssql_server.main.fully_qualified_domain_name};Database=${azurerm_mssql_database.main.name};"
  sensitive   = true
}
```

### 5.4 Cross Module Dependencies

Outputs create dependencies between modules. When module A outputs a value that module B uses as input, Terraform infers the dependency and creates module A's resources before module B's.

This implicit dependency management is powerful. I do not need to manually specify the order in which modules are created. Terraform builds the dependency graph automatically.

### 5.5 DevOps Skills Learned

Output management teaches me interface design for modules, dependency management, and information hiding. These skills enable clean module boundaries and reliable compositions.

---

## 6. State Management

### 6.1 What State Is and Why It Matters

Terraform state is a JSON file that maps resource definitions in your configuration to real world resources in Azure. When you define resource "azurerm_resource_group" "main", Terraform creates an entry in state linking this definition to the Azure resource ID /subscriptions/xxx/resourceGroups/cloudmart-prod.

State serves three critical purposes: resource mapping (knowing which Azure resource corresponds to which Terraform resource), metadata storage (caching resource attributes to avoid constant API lookups), and performance (enabling Terraform to determine changes without querying every resource on every run).

Without state, Terraform would not know whether a resource exists or needs to be created. Every plan would attempt to create everything, leading to duplicate resources and errors.

### 6.2 Local State

By default, Terraform stores state in a local file named terraform.tfstate. This is suitable for individual learning but not for team environments. Local state causes problems: it cannot be shared between team members, it is not backed up if your laptop fails, concurrent operations risk corruption, and sensitive values are stored in plain text on disk.

### 6.3 Remote State

Remote state stores the state file in a shared location accessible to the entire team. CloudMart uses Azure Blob Storage for remote state. The state file is stored in a blob container with versioning enabled for history. Each environment has its own state file: dev.terraform.tfstate, staging.terraform.tfstate, and production.terraform.tfstate.

Remote state configuration:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "cloudmart-terraform-state-rg"
    storage_account_name = "cloudmarttfstate"
    container_name       = "tfstate"
    key                  = "production.terraform.tfstate"
    use_oidc             = true
  }
}
```

The use_oidc flag enables authentication through OpenID Connect, which integrates with GitHub Actions for secure authentication without storing service principal secrets.

### 6.4 State Locking

State locking prevents concurrent modifications. When Terraform begins an operation, it acquires a lock. If another Terraform process tries to modify the same state, it waits for the lock to be released.

Azure Blob Storage backend uses a blob lease for locking. When Terraform runs, it acquires a lease on the state blob. The lease expires automatically if the Terraform process crashes, preventing permanent locks.

State locking is essential for team environments. Without it, two engineers running apply simultaneously would corrupt the state file.

### 6.5 State Security

State files contain sensitive data: connection strings, passwords, certificate private keys. Even with sensitive marking, values can appear in state. Securing state is critical.

CloudMart implements these state security measures: remote state in Azure Blob Storage with encryption at rest using Microsoft managed keys, blob versioning to recover from accidental deletion or corruption, private endpoint on the storage account so state never traverses the public internet, least privilege access so only CI/CD pipelines and senior engineers can read state, and state file scanning in CI to detect accidentally committed secrets.

### 6.6 State Workflows

Common state workflows include importing existing resources into state when adopting Terraform for existing infrastructure, moving resources between state files when reorganizing modules, replacing resources when a resource must be recreated with different parameters, and refreshing state to reconcile Terraform state with actual infrastructure without making changes.

### 6.7 DevOps Skills Learned

State management is a critical Terraform skill. I am learning state architecture, remote backends, locking mechanisms, security practices, and workflow commands. These skills prevent data loss and enable team collaboration.

---

## 7. Backend Configuration

### 7.1 Backend Types

Terraform supports multiple backend types: local (default file based), azurerm (Azure Blob Storage), s3 (AWS S3 with DynamoDB locking), gcs (Google Cloud Storage), and remote (Terraform Cloud/Enterprise).

For CloudMart, azurerm is the natural choice because we are deploying to Azure. The Azure backend provides state storage in Blob Storage, locking through blob leases, and encryption through Azure Storage Service Encryption.

### 7.2 Azure Blob Storage Backend

The Azure backend requires a storage account and container created beforehand. This bootstrap resource is created manually or through a separate Terraform configuration (often called the "bootstrap" or "state" Terraform).

The bootstrap process: create a resource group for Terraform state, create a storage account with versioning and soft delete enabled, create a blob container named tfstate, configure RBAC so CI/CD pipelines have Storage Blob Data Contributor role, and then reference this storage account in backend configuration.

### 7.3 Backend Initialization

When you run terraform init for the first time, Terraform prompts for backend configuration. For automation, backend configuration can be provided through a backend.tfvars file:

```
resource_group_name  = "cloudmart-terraform-state-rg"
storage_account_name = "cloudmarttfstate"
container_name       = "tfstate"
key                  = "production.terraform.tfstate"
use_oidc             = true
subscription_id      = "xxx"
tenant_id            = "xxx"
```

Then initialize with: terraform init -backend-config=backend.tfvars

### 7.4 Partial Configuration

Backend configuration can be split between the backend block in code and command line flags. This is useful when some values are static (container name) and others vary by environment (state file key).

CloudMart uses partial configuration: the backend block in code specifies the backend type and container name, while the backend.tfvars file specifies the state key and storage account details for each environment.

### 7.5 DevOps Skills Learned

Backend configuration teaches me bootstrap procedures, initialization workflows, and partial configuration patterns. These skills are essential for setting up Terraform in new environments.

---

## 8. Workspaces and Environments

### 8.1 Workspace Concept

Terraform workspaces are alternate state files within the same backend. The default workspace is named "default". Additional workspaces like "dev", "staging", and "production" each have their own state file but share the same configuration code.

Workspaces are managed with commands: terraform workspace list shows available workspaces, terraform workspace new dev creates a new workspace, terraform workspace select dev switches to a workspace, and terraform workspace show displays the current workspace.

### 8.2 Environment Isolation

CloudMart uses workspaces for environment isolation. The same Terraform configuration applies to all environments, but variable values differ. The dev workspace uses smaller VM sizes and Basic tier databases. The production workspace uses larger VMs and Premium tier databases.

Workspace selection determines which state file is used. terraform workspace select production followed by terraform apply modifies only production resources.

### 8.3 Workspace Commands

A typical workflow: terraform workspace select dev, terraform plan -var-file=dev.tfvars, terraform apply -var-file=dev.tfvars. After verifying dev, switch to staging: terraform workspace select staging, terraform plan -var-file=staging.tfvars, terraform apply -var-file=staging.tfvars. Finally production: terraform workspace select production, terraform plan -var-file=production.tfvars, terraform apply -var-file=production.tfvars.

### 8.4 Alternatives to Workspaces

Some teams prefer directory based isolation: separate Terraform configurations in directories like environments/dev, environments/staging, and environments/production. This provides stronger isolation because each environment is completely independent. Changes to one cannot affect another.

CloudMart uses directory based isolation rather than workspaces. This is safer for production: a mistyped workspace command cannot accidentally modify production while intending to modify dev.

### 8.5 DevOps Skills Learned

Environment isolation teaches me workspace management, configuration per environment, and the tradeoffs between workspace based and directory based isolation. These skills ensure safe multi environment workflows.

---

## 9. Resource Definitions

### 9.1 Azure Provider Configuration

The Azure provider configures authentication and default settings:

```hcl
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.75.0"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
    key_vault {
      purge_soft_delete_on_destroy = false
    }
  }
}
```

The features block configures provider behavior. prevent_deletion_if_contains_resources prevents accidentally deleting resource groups that contain resources. This safety feature has saved many engineers from destroying production environments.

Version constraints use semantic versioning operators: ~> 3.75.0 allows patch updates (3.75.1) but not minor updates (3.76.0). This ensures predictable behavior while receiving bug fixes.

### 9.2 Resource Syntax

Azure resources follow the pattern: resource "azurerm_<type>" "<name>" { ... }. The type corresponds to the Azure resource type. The name is used only within Terraform for referencing.

```hcl
resource "azurerm_resource_group" "main" {
  name     = "cloudmart-${var.environment}-rg"
  location = var.location

  tags = {
    Environment = var.environment
    Project     = "cloudmart"
    ManagedBy   = "terraform"
  }
}
```

### 9.3 Resource Dependencies

Terraform infers dependencies automatically when one resource references another. If resource A references resource B's ID, Terraform creates B before A. Explicit dependencies using depends_on are needed when there is no direct reference but ordering is required.

### 9.4 Resource Lifecycle

Lifecycle rules modify Terraform's default behavior:

```hcl
resource "azurerm_sql_database" "main" {
  # ... configuration ...

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [tags["last_modified"]]
  }
}
```

prevent_destroy causes terraform destroy to fail if this resource would be deleted. This protects critical databases from accidental destruction. ignore_changes tells Terraform to not update the resource when certain attributes change. This is useful for tags that are modified by external systems.

### 9.5 Data Sources

Data sources read existing resources rather than creating them. They are used to reference resources managed outside the current Terraform configuration or created by other modules.

```hcl
data "azurerm_resource_group" "state" {
  name = "cloudmart-terraform-state-rg"
}

data "azurerm_client_config" "current" {}
```

### 9.6 DevOps Skills Learned

Resource definitions teach me provider configuration, resource syntax, dependency management, lifecycle rules, and data sources. These skills are the foundation of writing Terraform configurations.

---

## 10. Naming Conventions

### 10.1 Resource Naming Strategy

Consistent naming enables identification, automation, and cost allocation. CloudMart uses the pattern: project-environment-resource-type-instance. Examples: cloudmart-prod-aks-main for the production AKS cluster, cloudmart-dev-sql-orders for the development order database, and cloudmart-staging-sb-events for the staging Service Bus.

This naming convention provides: immediate identification of what the resource is, which environment it belongs to, and which project it supports. It enables wildcard filtering in Azure CLI queries and cost reports.

### 10.2 Tagging Strategy

Every resource is tagged with: Environment (dev/staging/production), Project (cloudmart), ManagedBy (terraform), Owner (team email), CostCenter (department code), and Criticality (high/medium/low).

Tags enable: cost reporting by environment, automated shutdown policies for non production resources, access control through Azure Policy, and resource inventory automation.

### 10.3 Consistency Rules

Naming rules enforced through Azure Policy: all resources must have Environment, Project, and ManagedBy tags. Resource names must follow the approved pattern. Non compliant resources are flagged or prevented from creation.

### 10.4 DevOps Skills Learned

Naming conventions teach me resource organization, cost allocation, governance, and automation. These skills enable infrastructure management at scale.

---

## 11. Security Practices

### 11.1 Secret Management

Never store secrets in Terraform configuration or state. Instead, reference secrets from Azure Key Vault:

```hcl
data "azurerm_key_vault_secret" "sql_password" {
  name         = "sql-admin-password"
  key_vault_id = module.keyvault.id
}

resource "azurerm_mssql_server" "main" {
  administrator_login_password = data.azurerm_key_vault_secret.sql_password.value
}
```

This pattern ensures secrets are managed in Key Vault with proper access controls and rotation policies.

### 11.2 State Encryption

Azure Blob Storage automatically encrypts state at rest. For additional security, enable customer managed keys through Azure Key Vault. This ensures only authorized principals can decrypt the state.

### 11.3 Least Privilege

The Terraform service principal should have the minimum permissions needed. Use Contributor role on the target resource group rather than Subscription Owner. For Key Vault, use Key Vault Secrets Officer rather than full Administrator.

### 11.4 Audit Logging

Enable Azure Storage analytics logging on the state storage account. Log all read and write operations to detect unauthorized access. Send logs to Log Analytics for querying and alerting.

### 11.5 DevOps Skills Learned

Security practices teach me secret management, encryption, least privilege, and audit logging for infrastructure as code. These skills prevent credential leaks and unauthorized access.

---

## 12. Execution Flow

### 12.1 Init Command

terraform init initializes the working directory. It downloads providers and modules, configures the backend, and validates the configuration syntax. Run init after cloning a repository, after adding new providers, or after changing backend configuration.

### 12.2 Plan Command

terraform plan creates an execution plan. It compares the configuration to the current state, queries Azure for actual resource states, and determines what changes are needed. The output shows additions with +, changes with ~, and destructions with -.

Plan output is saved to a file for review and later application: terraform plan -out=tfplan

### 12.3 Apply Command

terraform apply executes the plan. With a saved plan file, it applies exactly what was planned: terraform apply tfplan. Without a plan file, it creates a new plan and prompts for confirmation.

In CI/CD pipelines, use auto approve for non production environments after automated validation. Production applications always require manual review and approval.

### 12.4 Destroy Command

terraform destroy removes all resources defined in the configuration. Use with extreme caution in production. In development, destroy and recreate environments regularly to validate the full provisioning process.

### 12.5 Refresh and Import

terraform refresh updates the state file to match actual infrastructure without making changes. This is useful when resources were modified outside Terraform.

terraform import brings existing resources under Terraform management. When adopting Terraform for existing infrastructure, import maps real resources to Terraform configuration.

### 12.6 DevOps Skills Learned

Execution flow teaches me command workflows, plan review, safe application, and state reconciliation. These skills are the daily practice of infrastructure engineering.

---

## 13. Dependency Graph

### 13.1 Implicit Dependencies

Terraform infers dependencies from resource references. If resource A uses resource B's ID, Terraform creates B first:

```hcl
resource "azurerm_subnet" "aks" {
  resource_group_name = azurerm_resource_group.main.name
  # Implicit dependency: resource group created before subnet
}
```

### 13.2 Explicit Dependencies

depends_on forces ordering when there is no direct reference:

```hcl
resource "azurerm_kubernetes_cluster" "main" {
  depends_on = [azurerm_subnet.aks]
  # AKS needs the subnet even if it does not directly reference it
}
```

### 13.3 Graph Visualization

terraform graph outputs the dependency graph in DOT format. Visualizing with GraphViz shows the complete dependency structure. This is invaluable for understanding complex configurations and debugging ordering issues.

### 13.4 Dependency Best Practices

Minimize explicit dependencies. Let Terraform infer them naturally. Too many explicit dependencies create fragility: renaming a resource breaks all its explicit dependents. Use explicit dependencies only for ordering that Terraform cannot infer.

### 13.5 DevOps Skills Learned

Dependency management teaches me graph based thinking, implicit vs explicit dependencies, and visualization. These skills enable me to understand and troubleshoot complex Terraform configurations.

---

## 14. Best Practices

### 14.1 Code Organization

Use consistent formatting with terraform fmt. Keep modules small and focused. Separate environments completely. Document all variables and outputs. Use meaningful resource names.

### 14.2 Documentation

Every module has a README with description, usage example, inputs table, outputs table, and requirements. Variable descriptions explain purpose and valid values. Output descriptions explain what the value represents.

### 14.3 Testing Strategies

Terraform testing includes: terraform validate for syntax checking, terraform plan for change preview, tflint for best practice linting, checkov for security scanning, and integration tests with Terratest for end to end validation.

CloudMart runs validate, tflint, and checkov on every pull request. Plan output is reviewed by a second engineer before apply.

### 14.4 Version Pinning

Pin provider versions to prevent unexpected breaking changes. Use ~> for minor version pinning allowing patches. Review changelogs before upgrading providers.

### 14.5 Error Handling

Use validation rules on variables to catch errors early. Use lifecycle rules to protect critical resources. Use depends_on carefully to prevent ordering errors. Always review plan output before applying.

### 14.6 DevOps Skills Learned

Best practices teach me code quality, documentation, testing, and safe change management for infrastructure.

---

## 15. Common Mistakes

### 15.1 State Conflicts

Running Terraform from multiple locations without state locking corrupts state. Always use remote state with locking. Never commit terraform.tfstate to version control.

### 15.2 Circular Dependencies

Resource A depends on B, B depends on C, and C depends on A. Terraform cannot resolve circular dependencies. Refactor to break the cycle, often by extracting shared resources into a separate module.

### 15.3 Hardcoded Values

Hardcoding resource names, locations, or sizes prevents reuse. Use variables for anything that might change between environments.

### 15.4 Missing Constraints

Without variable validation, invalid values cause cryptic Azure API errors. Add validation rules to catch errors early with clear messages.

### 15.5 Security Oversights

Storing secrets in variables or state, using overly permissive credentials, or disabling encryption. Follow the security practices in section 11.

### 15.6 DevOps Skills Learned

Learning from mistakes teaches me defensive practices, error prevention, and troubleshooting.

---

## 16. Enterprise Patterns

### 16.1 GitOps Integration

GitOps stores infrastructure definitions in Git and uses automated agents to apply changes. Terraform integrates with GitOps through tools like Atlantis or Terraform Cloud. Pull requests trigger plan comments. Approval triggers apply.

### 16.2 CI/CD Pipeline Integration

Terraform runs in CI/CD pipelines for consistency and auditability. The pipeline authenticates through OIDC (no stored secrets), runs validate and plan, posts plan output for review, requires manual approval for production, and applies with the approved plan.

### 16.3 Policy as Code

OPA (Open Policy Agent) and Terraform's Sentinel enforce policies on Terraform plans. Policies can require specific tags, prevent public network access, mandate encryption, and limit approved resource types.

### 16.4 Drift Detection

Drift occurs when resources are modified outside Terraform. Scheduled terraform plan runs detect drift by showing differences between state and configuration. Alerts notify when drift is detected.

### 16.5 DevOps Skills Learned

Enterprise patterns teach me GitOps, CI/CD integration, policy enforcement, and drift detection. These skills enable infrastructure management at organizational scale.

---

## 17. Complete Terraform Configuration Reference

### 17.1 Networking Module

```hcl
# modules/networking/main.tf
resource "azurerm_virtual_network" "main" {
  name                = "${var.project}-${var.environment}-vnet"
  resource_group_name = var.resource_group_name
  location            = var.location
  address_space       = [var.vnet_address_space]

  tags = var.tags
}

resource "azurerm_subnet" "aks" {
  name                 = "aks-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.aks_subnet_prefix]

  delegation {
    name = "aks-delegation"
    service_delegation {
      name    = "Microsoft.ContainerService/managedClusters"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }
}

resource "azurerm_subnet" "database" {
  name                 = "db-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.db_subnet_prefix]
  service_endpoints    = ["Microsoft.Sql", "Microsoft.Storage"]
}

resource "azurerm_network_security_group" "aks" {
  name                = "${var.project}-${var.environment}-aks-nsg"
  resource_group_name = var.resource_group_name
  location            = var.location

  security_rule {
    name                       = "AllowAppGwInbound"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_address_prefix      = "GatewayManager"
    destination_address_prefix = "*"
    destination_port_range     = "80"
  }

  security_rule {
    name                       = "AllowHttpsInbound"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
    destination_port_range     = "443"
  }
}

resource "azurerm_subnet_network_security_group_association" "aks" {
  subnet_id                 = azurerm_subnet.aks.id
  network_security_group_id = azurerm_network_security_group.aks.id
}
```

### 17.2 AKS Module

```hcl
# modules/aks/main.tf
resource "azurerm_kubernetes_cluster" "main" {
  name                = "${var.project}-${var.environment}-aks"
  resource_group_name = var.resource_group_name
  location            = var.location
  dns_prefix          = "${var.project}${var.environment}"
  kubernetes_version  = var.kubernetes_version

  default_node_pool {
    name           = "system"
    node_count     = var.system_node_count
    vm_size        = var.system_node_size
    vnet_subnet_id = var.vnet_subnet_id
    node_taints    = ["CriticalAddonsOnly=true:NoSchedule"]

    upgrade_settings {
      max_surge = "1"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    network_policy    = "calico"
    load_balancer_sku = "standard"
    service_cidr      = var.service_cidr
    dns_service_ip    = var.dns_service_ip
  }

  oms_agent {
    log_analytics_workspace_id = var.log_analytics_workspace_id
  }

  azure_policy_enabled = true

  tags = var.tags
}

resource "azurerm_kubernetes_cluster_node_pool" "general" {
  name                  = "general"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.main.id
  vm_size               = var.general_node_size
  node_count            = var.general_node_count
  vnet_subnet_id        = var.vnet_subnet_id

  enable_auto_scaling = true
  min_count           = var.general_min_count
  max_count           = var.general_max_count

  tags = var.tags
}
```

### 17.3 Database Module

```hcl
# modules/database/main.tf
resource "azurerm_mssql_server" "main" {
  name                         = "${var.project}-${var.environment}-sql"
  resource_group_name          = var.resource_group_name
  location                     = var.location
  version                      = "12.0"
  administrator_login          = var.admin_username
  administrator_login_password = var.admin_password

  azuread_administrator {
    login_username = var.ad_admin_username
    object_id      = var.ad_admin_object_id
  }

  minimum_tls_version = "1.2"
}

resource "azurerm_mssql_database" "main" {
  for_each = var.databases

  name                        = each.key
  server_id                   = azurerm_mssql_server.main.id
  sku_name                    = each.value.sku_name
  collation                   = "SQL_Latin1_General_CP1_CI_AS"
  max_size_gb                 = each.value.max_size_gb
  zone_redundant              = var.environment == "production"
  read_replica_count          = each.value.read_replica_count

  short_term_retention_policy {
    retention_days = var.backup_retention_days
  }

  long_term_retention_policy {
    weekly_retention  = var.environment == "production" ? "P4W" : null
    monthly_retention = var.environment == "production" ? "P12M" : null
  }
}

resource "azurerm_mssql_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_private_endpoint" "sql" {
  name                = "${var.project}-${var.environment}-sql-pe"
  resource_group_name = var.resource_group_name
  location            = var.location
  subnet_id           = var.private_endpoint_subnet_id

  private_service_connection {
    name                           = "sql-privateserviceconnection"
    private_connection_resource_id = azurerm_mssql_server.main.id
    is_manual_connection           = false
    subresource_names              = ["sqlServer"]
  }
}
```

### 17.4 Cache Module

```hcl
# modules/cache/main.tf
resource "azurerm_redis_cache" "main" {
  name                = "${var.project}-${var.environment}-redis"
  resource_group_name = var.resource_group_name
  location            = var.location
  capacity            = var.capacity
  family              = var.family
  sku_name            = var.sku_name
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {
    maxmemory_policy = "allkeys-lru"
    rdb_backup_enabled = var.environment == "production"
    rdb_backup_frequency = var.environment == "production" ? 60 : null
  }

  patch_schedule {
    day_of_week    = "Sunday"
    start_hour_utc = 2
  }

  tags = var.tags
}
```

### 17.5 Service Bus Module

```hcl
# modules/servicebus/main.tf
resource "azurerm_servicebus_namespace" "main" {
  name                = "${var.project}-${var.environment}-sb"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = var.sku
  zone_redundant      = var.environment == "production"

  tags = var.tags
}

resource "azurerm_servicebus_topic" "domain_events" {
  name                  = "domain-events"
  namespace_id          = azurerm_servicebus_namespace.main.id
  partitioning_enabled  = true
}

resource "azurerm_servicebus_subscription" "notifications" {
  name               = "notifications-sub"
  topic_id           = azurerm_servicebus_topic.domain_events.id
  max_delivery_count = 10
}

resource "azurerm_servicebus_subscription" "analytics" {
  name               = "analytics-sub"
  topic_id           = azurerm_servicebus_topic.domain_events.id
  max_delivery_count = 10
}
```

### 17.6 Key Vault Module

```hcl
# modules/keyvault/main.tf
resource "azurerm_key_vault" "main" {
  name                = "${var.project}-${var.environment}-kv"
  resource_group_name = var.resource_group_name
  location            = var.location
  tenant_id           = var.tenant_id
  sku_name            = "standard"

  soft_delete_retention_days = 7
  purge_protection_enabled   = var.environment == "production"

  access_policy {
    tenant_id = var.tenant_id
    object_id = var.aks_identity_principal_id

    secret_permissions = ["Get", "List"]
  }

  network_acls {
    default_action             = "Deny"
    bypass                     = "AzureServices"
    virtual_network_subnet_ids = [var.aks_subnet_id]
  }

  tags = var.tags
}
```

### 17.7 Application Gateway Module

```hcl
# modules/appgateway/main.tf
resource "azurerm_application_gateway" "main" {
  name                = "${var.project}-${var.environment}-agw"
  resource_group_name = var.resource_group_name
  location            = var.location

  sku {
    name     = var.sku_name
    tier     = var.sku_tier
    capacity = var.capacity
  }

  gateway_ip_configuration {
    name      = "gateway-ip-config"
    subnet_id = var.gateway_subnet_id
  }

  frontend_ip_configuration {
    name                 = "frontend-ip"
    public_ip_address_id = azurerm_public_ip.main.id
  }

  frontend_port {
    name = "https-port"
    port = 443
  }

  ssl_certificate {
    name     = "cloudmart-cert"
    key_vault_secret_id = var.certificate_secret_id
  }

  backend_address_pool {
    name  = "aks-backend-pool"
    fqdns = [var.aks_ingress_fqdn]
  }

  http_listener {
    name                           = "https-listener"
    frontend_ip_configuration_name = "frontend-ip"
    frontend_port_name             = "https-port"
    protocol                       = "Https"
    ssl_certificate_name           = "cloudmart-cert"
  }

  request_routing_rule {
    name                       = "aks-routing-rule"
    rule_type                  = "PathBasedRouting"
    http_listener_name         = "https-listener"
    backend_address_pool_name  = "aks-backend-pool"
    backend_http_settings_name = "aks-http-settings"
    url_path_map_name          = "path-map"
  }

  waf_configuration {
    enabled          = true
    firewall_mode    = "Prevention"
    rule_set_type    = "OWASP"
    rule_set_version = "3.2"
  }

  tags = var.tags
}
```

### 17.8 Monitoring Module

```hcl
# modules/monitoring/main.tf
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.project}-${var.environment}-logs"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "PerGB2018"
  retention_in_days   = var.log_retention_days

  tags = var.tags
}

resource "azurerm_application_insights" "main" {
  name                = "${var.project}-${var.environment}-appinsights"
  resource_group_name = var.resource_group_name
  location            = var.location
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"

  tags = var.tags
}

resource "azurerm_monitor_action_group" "critical" {
  name                = "${var.project}-${var.environment}-critical-alerts"
  resource_group_name = var.resource_group_name
  short_name          = "critical"

  email_receiver {
    name          = "oncall-team"
    email_address = var.alert_email
  }

  webhook_receiver {
    name                    = "slack-alerts"
    service_uri             = var.slack_webhook_url
    use_common_alert_schema = true
  }
}
```

### 17.9 DevOps Skills Learned

The configuration reference teaches me real world Terraform patterns for Azure resources. These configurations can be adapted for any Azure project, making this knowledge transferable across employers and projects.

---

## What I Have Accomplished in This Volume

This volume documented the complete Terraform architecture for CloudMart. I covered Terraform fundamentals including how it works internally, project folder structure with environment and module organization, module architecture with composition patterns, variables and inputs with validation, outputs for cross module communication, state management with remote backends and locking, backend configuration for Azure Blob Storage, workspace and environment isolation strategies, resource definitions with Azure provider configuration, naming and tagging conventions, security practices for secrets and state, execution flow for init/plan/apply/destroy, dependency graph management, best practices for code quality, common mistakes and how to avoid them, enterprise patterns for GitOps and CI/CD integration, and complete Terraform configuration reference for all CloudMart modules.

**DevOps skills learned in this volume:** Infrastructure as Code architecture, Terraform module design, state management, remote backend configuration, security practices for IaC, CI/CD integration for infrastructure, dependency management, and Azure resource provisioning through code.

**Interview questions this prepares me for:** How do you structure Terraform for a multi environment setup? How do you manage Terraform state in a team? How do you secure Terraform configurations? What is the difference between implicit and explicit dependencies? How do you implement CI/CD for infrastructure changes? How do you handle secrets in Terraform?

**Real world engineering problem this solves:** Enterprise infrastructure must be managed as code. Manual provisioning is error prone, not reproducible, and impossible to audit. Terraform provides the automation, consistency, and auditability that enterprises require. This volume demonstrates how to implement Terraform at a scale that matches production enterprise requirements.

**Azure services being mastered:** Terraform Azure provider, Azure Blob Storage for state, Azure Resource Manager API integration.

**DevOps concepts being mastered:** Infrastructure as Code, GitOps, immutable infrastructure, configuration management, state management, module design, and infrastructure testing.

---

End of Volume 5