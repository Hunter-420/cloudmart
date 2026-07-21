# Volume 8: CI/CD with GitHub Actions

## The Purpose of This Volume

This volume documents the complete continuous integration and continuous delivery pipeline for the CloudMart platform using GitHub Actions. CI/CD is the practice of automating the build, test, and deployment of software. It is the heartbeat of DevOps engineering. Without CI/CD, deployments are manual, error prone, and stressful. With CI/CD, deployments become routine, automated, and reversible.

GitHub Actions is GitHub's native CI/CD platform. It integrates directly with GitHub repositories, requires no additional infrastructure, and has a massive ecosystem of reusable actions. For CloudMart, GitHub Actions provides the automation that takes code from commit to production.

This volume covers pipeline architecture, workflow design, testing stages, security scanning, container builds, infrastructure deployment, Kubernetes deployment, and production release management.

---

## Detailed Table of Contents

1. CI/CD Fundamentals
   1.1 What CI/CD Is and Why It Exists
   1.2 Continuous Integration vs Continuous Delivery vs Continuous Deployment
   1.3 The CI/CD Pipeline Anatomy
   1.4 GitHub Actions Architecture
   1.5 DevOps Skills Learned

2. Repository Structure
   2.1 Mono repo vs Poly repo
   2.2 Branching Strategy
   2.3 Directory Layout
   2.4 Workflow File Organization
   2.5 DevOps Skills Learned

3. PR Validation Pipeline
   3.1 Trigger Conditions
   3.2 Code Checkout
   3.3 Linting and Formatting
   3.4 Unit Testing
   3.5 Code Coverage
   3.6 Build Verification
   3.7 DevOps Skills Learned

4. Static Analysis Pipeline
   4.1 SonarQube Integration
   4.2 Code Quality Gates
   4.3 Code Smell Detection
   4.4 Technical Debt Tracking
   4.5 DevOps Skills Learned

5. Security Scanning Pipeline
   5.1 Dependency Vulnerability Scanning
   5.2 Secret Detection
   5.3 SAST with CodeQL
   5.4 Container Image Scanning
   5.5 Infrastructure as Code Scanning
   5.6 DevOps Skills Learned

6. Docker Build Pipeline
   6.1 Build Strategy
   6.2 Multi Architecture Builds
   6.3 Layer Caching
   6.4 Image Tagging
   6.5 Registry Push
   6.6 DevOps Skills Learned

7. Terraform Pipeline
   7.1 Terraform Validation
   7.2 Terraform Plan
   7.3 Plan Review
   7.4 Terraform Apply
   7.5 State Management
   7.6 DevOps Skills Learned

8. Deployment Pipeline
   8.1 Environment Promotion
   8.2 Kubernetes Deployment
   8.3 Helm Chart Deployment
   8.4 Database Migrations
   8.5 Smoke Testing
   8.6 Rollback Strategy
   8.7 DevOps Skills Learned

9. Notification and Reporting
   9.1 Slack Integration
   9.2 Email Notifications
   9.3 Build Status Reporting
   9.4 Release Notes Generation
   9.5 DevOps Skills Learned

10. Pipeline Security
    10.1 OIDC Authentication
    10.2 Secret Management
    10.3 Workflow Permissions
    10.4 Runner Security
    10.5 DevOps Skills Learned

11. Advanced Patterns
    11.1 Matrix Builds
    11.2 Reusable Workflows
    11.3 Composite Actions
    11.4 Conditional Execution
    11.5 Caching Strategies
    11.6 DevOps Skills Learned

12. Complete Workflow Reference
    12.1 PR Validation Workflow
    12.2 Build and Deploy Workflow
    12.3 Terraform Workflow
    12.4 Nightly Workflow
    12.5 DevOps Skills Learned

---

## 1. CI/CD Fundamentals

### 1.1 What CI/CD Is and Why It Exists

Before CI/CD, software releases were events. Development teams would work for months on a feature branch, then spend weeks merging, testing, and fixing integration issues. The final deployment was a high stress operation often scheduled for weekends with the entire team on standby. Rollbacks were complex and risky. This waterfall approach to releases caused delayed feedback, integration conflicts, and afraid to deploy syndrome where teams avoided releases because they were so painful.

CI/CD automates and streamlines this process. Continuous Integration means integrating code changes frequently, multiple times per day. Each integration triggers automated builds and tests that catch problems immediately. Continuous Delivery means keeping code in a deployable state at all times. Any successful build could be deployed to production with the press of a button. Continuous Deployment takes this further by automatically deploying successful builds to production without human intervention.

### 1.2 Continuous Integration vs Continuous Delivery vs Continuous Deployment

Continuous Integration focuses on the development phase. Developers merge code to main frequently. Automated builds compile the code and run unit tests. If the build or tests fail, the team fixes the problem immediately before continuing. CI ensures the main branch is always in a working state.

Continuous Delivery extends CI by ensuring that every successful build can be deployed to production. The deployment pipeline stages the application through testing environments. A manual approval gate controls production deployment. The software is always ready to deploy, but humans decide when.

Continuous Deployment removes the manual approval gate. Every successful build automatically deploys to production. This requires exceptional test coverage, monitoring, and rollback capability. Only mature teams with strong automation should practice continuous deployment.

CloudMart implements Continuous Integration and Continuous Delivery. Pull requests trigger builds and tests. Merges to main trigger deployment to staging. Production deployment requires manual approval.

### 1.3 The CI/CD Pipeline Anatomy

A CI/CD pipeline consists of stages that execute sequentially or in parallel. Each stage contains jobs that perform specific tasks. The CloudMart pipeline has these stages:

Trigger: pull request created or code merged to main

Build Stage: checkout code, restore dependencies, compile, run unit tests, perform static analysis

Security Stage: scan dependencies for vulnerabilities, scan for exposed secrets, perform SAST, scan container images

Package Stage: build Docker images, tag with Git SHA, push to Azure Container Registry, package Helm charts

Infrastructure Stage: validate Terraform, plan infrastructure changes, apply to target environment

Deploy Stage: deploy to Kubernetes via Helm, run database migrations, execute smoke tests

Verify Stage: run integration tests, verify deployment health, monitor error rates

Each stage can fail the pipeline. A failure in unit tests prevents security scanning. A security vulnerability prevents packaging. This fail fast approach catches problems early when they are cheapest to fix.

### 1.4 GitHub Actions Architecture

GitHub Actions is event driven. Workflows are triggered by GitHub events: push, pull_request, release, schedule (cron), and workflow_dispatch (manual). When an event occurs, GitHub Actions executes the workflow defined in .github/workflows.

A workflow consists of jobs. Each job runs on a runner (a virtual machine hosted by GitHub or self hosted). Jobs contain steps that execute actions (reusable automation units) or shell commands. Jobs can run sequentially (with needs) or in parallel (by default).

Runners come in different sizes: Ubuntu, Windows, macOS. For CloudMart, all workflows use ubuntu-latest runners. GitHub provides 2000 free minutes per month for private repositories, with additional minutes available for purchase.

### 1.5 DevOps Skills Learned

CI/CD fundamentals teach me the philosophy and practice of automated software delivery. These concepts are foundational to DevOps culture and engineering.

---

## 2. Repository Structure

### 2.1 Mono repo vs Poly repo

CloudMart uses a mono repo: all services, infrastructure, and configuration in a single Git repository. This simplifies cross cutting changes, enables atomic commits across services, and provides a single source of truth.

Tradeoffs: mono repos can be large and slow to clone, require careful directory structure, and need path based CI triggers to avoid building everything on every change. Poly repos (one repo per service) provide better isolation but make cross service changes more complex.

### 2.2 Branching Strategy

CloudMart uses trunk based development: a single main branch is the source of truth, feature branches are short lived (hours to days), all changes go through pull requests, and releases are tagged on main.

Branch protection rules on main: require pull request review (1 approver), require status checks to pass, require branches to be up to date, and prevent force pushes.

### 2.3 Directory Layout

```
cloudmart/
├── .github/
│   └── workflows/
│       ├── pr-validation.yml
│       ├── build-and-deploy.yml
│       ├── terraform.yml
│       └── nightly.yml
├── src/
│   ├── CloudMart.ApiGateway/
│   ├── CloudMart.ProductService/
│   ├── CloudMart.OrderService/
│   └── ...
├── terraform/
│   ├── modules/
│   └── environments/
├── helm/
│   └── charts/
├── tests/
│   ├── integration/
│   └── e2e/
└── docs/
```

### 2.4 Workflow File Organization

Workflow files live in .github/workflows. Each file defines one workflow. File names describe the workflow purpose: pr-validation.yml, build-and-deploy.yml, terraform.yml.

### 2.5 DevOps Skills Learned

Repository structure teaches me code organization for microservices, branching strategies, and CI/CD integration with version control.

---

## 3. PR Validation Pipeline

### 3.1 Trigger Conditions

The PR validation workflow triggers on: pull_request to main branch with types [opened, synchronize, reopened].

Path filters ensure only relevant changes trigger the workflow. A change to documentation does not trigger the full build.

### 3.2 Code Checkout

The checkout action fetches the repository. For PRs, it checks out the merge commit (the result of merging the PR branch into main). This ensures tests run against the final merged state.

### 3.3 Linting and Formatting

The pipeline runs: dotnet format --verify-no-changes to check C# formatting, eslint for TypeScript, markdownlint for documentation, and terraform fmt -check for Terraform formatting.

### 3.4 Unit Testing

The pipeline runs dotnet test for all projects. Tests execute in parallel where possible. Failed tests fail the pipeline immediately.

### 3.5 Code Coverage

The pipeline generates coverage reports using Coverlet. Reports are uploaded to Codecov for tracking. Coverage thresholds are enforced: 80% line coverage minimum for API projects, 70% for frontend projects.

### 3.6 Build Verification

The pipeline builds all Docker images to verify they compile successfully. Images are not pushed to the registry during PR validation.

### 3.7 DevOps Skills Learned

PR validation teaches me quality gates, automated testing, and fast feedback loops for developers.

---

## 4. Static Analysis Pipeline

### 4.1 SonarQube Integration

SonarQube analyzes code quality: code smells, bugs, vulnerabilities, duplication, and test coverage. CloudMart runs SonarQube analysis on every PR and merge to main.

### 4.2 Code Quality Gates

Quality gates define acceptable quality levels. CloudMart's quality gate requires: no new critical issues, code coverage above 80%, and duplication below 3%.

### 4.3 Code Smell Detection

SonarQube detects patterns like: methods that are too long, classes with too many responsibilities, and code duplication. These warnings help maintain code quality over time.

### 4.4 Technical Debt Tracking

SonarQube estimates technical debt in days. This metric helps prioritize refactoring work. CloudMart tracks technical debt trends, aiming to reduce debt over time.

### 4.5 DevOps Skills Learned

Static analysis teaches me code quality automation, quality gate enforcement, and technical debt management.

---

## 5. Security Scanning Pipeline

### 5.1 Dependency Vulnerability Scanning

The pipeline runs dotnet list package --vulnerable to detect vulnerable NuGet packages. npm audit checks JavaScript dependencies. Failing builds block deployment until vulnerabilities are resolved.

### 5.2 Secret Detection

gitleaks scans for accidentally committed secrets: API keys, passwords, tokens, and certificates. Pre commit hooks also run gitleaks locally to catch secrets before commit.

### 5.3 SAST with CodeQL

CodeQL performs static application security testing. It analyzes code for security vulnerabilities like SQL injection, XSS, and insecure deserialization. GitHub provides CodeQL free for public repositories.

### 5.4 Container Image Scanning

Trivy scans Docker images for OS and application vulnerabilities. The pipeline fails if critical vulnerabilities are found. Reports are uploaded as build artifacts.

### 5.5 Infrastructure as Code Scanning

checkov scans Terraform configurations for security misconfigurations: unencrypted storage, open security groups, and missing encryption. Results are posted as PR comments.

### 5.6 DevOps Skills Learned

Security scanning teaches me shift left security, automated vulnerability detection, and security gate enforcement in CI/CD.

---

## 6. Docker Build Pipeline

### 6.1 Build Strategy

The pipeline builds Docker images for all services. BuildKit is enabled for improved performance. Each service builds independently in parallel jobs.

### 6.2 Multi Architecture Builds

CloudMart builds for linux/amd64. If ARM support is needed in the future, multi architecture builds can be enabled with docker buildx.

### 6.3 Layer Caching

GitHub Actions cache action caches Docker layers between builds. This significantly speeds up builds when dependencies have not changed. Cache keys are based on the Dockerfile hash and branch name.

### 6.4 Image Tagging

Images are tagged with: Git commit SHA (immutable reference), Git short SHA (human readable), branch name, and semantic version for releases.

### 6.5 Registry Push

Images are pushed to Azure Container Registry using OIDC authentication. The pipeline authenticates to Azure using the azure/login action with a federated credential. No secrets are stored in GitHub.

### 6.6 DevOps Skills Learned

Docker build automation teaches me container image management, caching strategies, tagging conventions, and secure registry authentication.

---

## 7. Terraform Pipeline

### 7.1 Terraform Validation

The pipeline runs terraform init and terraform validate to check syntax. tflint checks for best practices and common mistakes.

### 7.2 Terraform Plan

terraform plan generates an execution plan. The plan is saved to a file and uploaded as an artifact. For PRs, the plan output is posted as a PR comment using the terraform-plan action.

### 7.3 Plan Review

Infrastructure changes require manual review. The plan shows additions, modifications, and destructions. Destruction of critical resources (databases, load balancers) requires additional approval.

### 7.4 Terraform Apply

terraform apply executes the approved plan. Apply runs only on the main branch after PR merge. For production, a manual approval gate is required before apply.

### 7.5 State Management

The pipeline authenticates to Azure Blob Storage for state using OIDC. State locking prevents concurrent modifications. The workspace is selected based on the target environment.

### 7.6 DevOps Skills Learned

Terraform CI/CD teaches me infrastructure change management, plan review workflows, and state locking in automated pipelines.

---

## 8. Deployment Pipeline

### 8.1 Environment Promotion

Builds flow through environments: dev (automatic deployment on merge), staging (automatic deployment on merge), and production (manual approval required).

Promotion uses the same image artifact across environments. The image built for dev is the same image promoted to staging and production. This ensures what was tested is what is deployed.

### 8.2 Kubernetes Deployment

The pipeline uses Helm to deploy to AKS. Helm upgrade installs or upgrades the release. Values files are selected per environment: values-dev.yaml, values-staging.yaml, values-production.yaml.

### 8.3 Helm Chart Deployment

```yaml
- name: Deploy to AKS
  run: |
    helm upgrade --install product-service ./helm/charts/product-service \
      --namespace cloudmart \
      --set image.tag=${{ github.sha }} \
      --values ./helm/charts/product-service/values-${{ inputs.environment }}.yaml \
      --wait \
      --timeout 10m
```

The --wait flag blocks until deployments are ready. --timeout prevents indefinite waits.

### 8.4 Database Migrations

Database migrations run as init containers before application pods start. This ensures the schema is compatible with the application code. For breaking changes, a two phase deployment is used: deploy code that handles both old and new schema, run migration, then deploy code that uses the new schema exclusively.

### 8.5 Smoke Testing

After deployment, smoke tests verify critical paths: HTTP 200 on health endpoints, API responds to basic queries, and frontend loads without errors.

### 8.6 Rollback Strategy

If deployment fails smoke tests or error rates spike, rollback to the previous Helm release: helm rollback product-service 0. This reverts to the previous version instantly.

### 8.7 DevOps Skills Learned

Deployment automation teaches me environment promotion, Helm deployment patterns, database migration strategies, smoke testing, and rollback procedures.

---

## 9. Notification and Reporting

### 9.1 Slack Integration

Workflows post status updates to Slack: build started, build succeeded, build failed, deployment complete, and deployment failed. The Slack action uses incoming webhooks.

### 9.2 Email Notifications

Email notifications are sent for production deployments and pipeline failures. Recipients include the team distribution list and the engineer who triggered the workflow.

### 9.3 Build Status Reporting

Build status is visible in the GitHub UI, in PR checks, and in Slack. Failed builds block PR merging through branch protection rules.

### 9.4 Release Notes Generation

The release drafter action automatically generates release notes from merged pull requests. Notes are organized by label: features, bug fixes, and infrastructure changes.

### 9.5 DevOps Skills Learned

Notification management teaches me status communication, incident awareness, and release documentation automation.

---

## 10. Pipeline Security

### 10.1 OIDC Authentication

OpenID Connect enables passwordless authentication between GitHub Actions and Azure. The workflow obtains a JWT token from GitHub, presents it to Azure AD, and receives an access token. No secrets are stored in GitHub.

Configuration: an Azure AD app registration represents GitHub Actions, a federated credential maps the GitHub repository to the app registration, and the workflow uses azure/login with the client ID, tenant ID, and subscription ID.

### 10.2 Secret Management

Required secrets (like SonarQube tokens) are stored as GitHub encrypted secrets. Secrets are not exposed in logs. Only workflows running on the default branch can access production secrets.

### 10.3 Workflow Permissions

Workflows use the principle of least permission. The GITHUB_TOKEN is scoped to the minimum required permissions. Workflow permissions are defined explicitly in the workflow file.

### 10.4 Runner Security

GitHub hosted runners are ephemeral: fresh VMs for each job. This prevents cross job contamination. For additional security, self hosted runners can be used for on premises requirements.

### 10.5 DevOps Skills Learned

Pipeline security teaches me OIDC, secret management, permission scoping, and runner security for CI/CD pipelines.

---

## 11. Advanced Patterns

### 11.1 Matrix Builds

Matrix builds run the same job with different configurations. CloudMart uses matrices to test against multiple .NET versions or run the same tests on different runner sizes.

### 11.2 Reusable Workflows

Reusable workflows define common pipeline steps that multiple workflows can call. CloudMart has reusable workflows for: Docker build and push, Helm deployment, and Terraform plan and apply.

### 11.3 Composite Actions

Composite actions combine multiple steps into a single reusable action. They are simpler than reusable workflows but less flexible. CloudMart uses composite actions for common setup steps.

### 11.4 Conditional Execution

Steps and jobs can be conditional: run only on specific branches, run only if previous steps succeeded or failed, and skip steps based on changed files.

### 11.5 Caching Strategies

Cache NuGet packages, npm modules, Docker layers, and Terraform providers between builds. Cache keys include lock file hashes for cache invalidation when dependencies change.

### 11.6 DevOps Skills Learned

Advanced patterns teach me workflow optimization, code reuse in CI/CD, and efficient caching strategies.

---

## 12. Complete Workflow Reference

### 12.1 PR Validation Workflow

```yaml
name: PR Validation
on:
  pull_request:
    branches: [main]
    paths:
      - 'src/**'
      - 'tests/**'
      - '.github/workflows/**'

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'
      - name: Check formatting
        run: dotnet format --verify-no-changes

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'
      - name: Restore
        run: dotnet restore
      - name: Build
        run: dotnet build --no-restore --configuration Release
      - name: Test
        run: dotnet test --no-build --verbosity normal
      - name: Coverage
        run: dotnet test --collect:"XPlat Code Coverage"
      - uses: codecov/codecov-action@v3
        with:
          files: '**/coverage.cobertura.xml'

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      - name: Upload results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  build-images:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [api-gateway, product-service, order-service, cart-service]
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t cloudmart/${{ matrix.service }}:${{ github.sha }} -f src/CloudMart.${{ matrix.service }}/Dockerfile .
```

### 12.2 Build and Deploy Workflow

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    outputs:
      image_tag: ${{ github.sha }}
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      - name: Login to ACR
        run: az acr login --name ${{ vars.ACR_NAME }}
      - name: Build and push images
        run: |
          for service in api-gateway product-service order-service cart-service; do
            docker build -t ${{ vars.ACR_NAME }}.azurecr.io/$service:${{ github.sha }} -f src/CloudMart.$service/Dockerfile .
            docker push ${{ vars.ACR_NAME }}.azurecr.io/$service:${{ github.sha }}
          done

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      - uses: azure/setup-kubectl@v3
      - uses: azure/setup-helm@v3
      - name: Configure kubectl
        run: az aks get-credentials --name cloudmart-staging-aks --resource-group cloudmart-staging-rg
      - name: Deploy
        run: |
          for service in api-gateway product-service order-service cart-service; do
            helm upgrade --install $service ./helm/charts/$service \
              --namespace cloudmart \
              --set image.tag=${{ needs.build-and-push.outputs.image_tag }} \
              --set image.repository=${{ vars.ACR_NAME }}.azurecr.io/$service \
              --values ./helm/charts/$service/values-staging.yaml \
              --wait --timeout 10m
          done
      - name: Smoke test
        run: |
          kubectl wait --for=condition=ready pod -l app=api-gateway -n cloudmart --timeout=300s
          curl -sf http://$(kubectl get svc api-gateway -n cloudmart -o jsonpath='{.status.loadBalancer.ingress[0].ip}')/health/ready

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      - uses: azure/setup-kubectl@v3
      - uses: azure/setup-helm@v3
      - name: Configure kubectl
        run: az aks get-credentials --name cloudmart-prod-aks --resource-group cloudmart-prod-rg
      - name: Deploy
        run: |
          for service in api-gateway product-service order-service cart-service; do
            helm upgrade --install $service ./helm/charts/$service \
              --namespace cloudmart \
              --set image.tag=${{ needs.build-and-push.outputs.image_tag }} \
              --set image.repository=${{ vars.ACR_NAME }}.azurecr.io/$service \
              --values ./helm/charts/$service/values-production.yaml \
              --wait --timeout 10m
          done
```

### 12.3 Terraform Workflow

```yaml
name: Terraform
on:
  pull_request:
    paths: ['terraform/**']
  push:
    branches: [main]
    paths: ['terraform/**']

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - name: Terraform fmt
        run: terraform fmt -check -recursive
      - name: Terraform init
        run: terraform init -backend=false
      - name: Terraform validate
        run: terraform validate
      - name: Run Checkov
        uses: bridgecrewio/checkov-action@master
        with:
          directory: terraform/
          framework: terraform

  plan:
    if: github.event_name == 'pull_request'
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      - name: Terraform init
        run: terraform init
        working-directory: terraform/environments/production
      - name: Terraform plan
        run: terraform plan -out=tfplan
        working-directory: terraform/environments/production
      - name: Upload plan
        uses: actions/upload-artifact@v3
        with:
          name: tfplan
          path: terraform/environments/production/tfplan

  apply:
    if: github.ref == 'refs/heads/main'
    needs: validate
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      - name: Terraform init
        run: terraform init
        working-directory: terraform/environments/production
      - name: Terraform plan
        run: terraform plan -out=tfplan
        working-directory: terraform/environments/production
      - name: Terraform apply
        run: terraform apply tfplan
        working-directory: terraform/environments/production
```

### 12.4 Nightly Workflow

The nightly workflow runs at 2 AM UTC: full integration test suite, security vulnerability rescan of all deployed images, backup verification test, and cost report generation.

### 12.5 DevOps Skills Learned

The workflow reference teaches me practical CI/CD implementation with GitHub Actions, including secure authentication, multi environment deployment, and infrastructure automation.

---

## What I Have Accomplished in This Volume

This volume documented the complete CI/CD pipeline for CloudMart using GitHub Actions. I covered CI/CD fundamentals and the differences between CI, CD, and continuous deployment, repository structure and branching strategy, PR validation pipeline with linting, testing, and formatting, static analysis with SonarQube integration, security scanning with dependency checks, SAST, and container scanning, Docker build pipeline with caching and tagging, Terraform pipeline with plan review and state management, deployment pipeline with environment promotion, Helm deployment, and smoke testing, notification and reporting integration, pipeline security with OIDC authentication, advanced patterns including reusable workflows and caching, and complete workflow YAML reference for all pipelines.

**DevOps skills learned in this volume:** CI/CD pipeline design, GitHub Actions workflow authoring, security scanning automation, container build automation, Helm deployment, environment promotion, OIDC authentication, reusable workflows, and pipeline security.

**Interview questions this prepares me for:** How do you design a CI/CD pipeline for microservices? How do you implement zero downtime deployments? What security scanning tools do you use in CI/CD? How does OIDC authentication work? How do you manage database migrations during deployment? How do you implement rollback in Kubernetes? What is the difference between CI and CD?

**Real world engineering problem this solves:** Every production system needs automated delivery. Manual deployments are slow, error prone, and stressful. This CI/CD pipeline provides the automation, safety checks, and rollback capability that production systems require. It demonstrates the practices used by top engineering organizations.

**Azure services being mastered:** GitHub Actions, Azure Container Registry, Azure AD OIDC, AKS deployment.

**DevOps concepts being mastered:** Continuous Integration, Continuous Delivery, shift left security, automated testing, environment promotion, infrastructure as code in CI/CD, and pipeline security.

---

End of Volume 8