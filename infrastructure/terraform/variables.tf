variable "resource_group_name" {
  type        = string
  description = "Name of the Azure Resource Group"
  default     = "cloudmart-rg"
}

variable "location" {
  type        = string
  description = "Azure region for all resources"
  default     = "East US"
}

variable "environment" {
  type        = string
  description = "Deployment environment (staging, production)"
  default     = "staging"
}

variable "acr_name" {
  type        = string
  description = "Azure Container Registry name (globally unique, alphanumeric)"
  default     = "cloudmartacr"
}

variable "aks_cluster_name" {
  type        = string
  description = "Azure Kubernetes Service cluster name"
  default     = "cloudmart-aks"
}

variable "aks_node_count" {
  type        = number
  description = "Number of nodes in the AKS default node pool"
  default     = 2
}
