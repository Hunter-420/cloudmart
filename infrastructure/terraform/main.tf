terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.5.0"
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "cloudmart" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    environment = var.environment
    project     = "cloudmart"
  }
}

resource "azurerm_container_registry" "cloudmart_acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.cloudmart.name
  location            = azurerm_resource_group.cloudmart.location
  sku                 = "Basic"
  admin_enabled       = true

  tags = {
    environment = var.environment
  }
}

resource "azurerm_kubernetes_cluster" "cloudmart_aks" {
  name                = var.aks_cluster_name
  location            = azurerm_resource_group.cloudmart.location
  resource_group_name = azurerm_resource_group.cloudmart.name
  dns_prefix          = var.aks_cluster_name

  default_node_pool {
    name       = "default"
    node_count = var.aks_node_count
    vm_size    = "Standard_D2_v2"
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "kubenet"
    load_balancer_sku = "standard"
  }

  tags = {
    environment = var.environment
  }
}

resource "azurerm_role_assignment" "aks_acr_pull" {
  principal_id                     = azurerm_kubernetes_cluster.cloudmart_aks.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.cloudmart_acr.id
  skip_service_principal_aad_check = true
}
