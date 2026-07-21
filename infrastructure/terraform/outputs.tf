output "resource_group_name" {
  description = "The name of the resource group"
  value       = azurerm_resource_group.cloudmart.name
}

output "acr_login_server" {
  description = "The login server URL for the Container Registry"
  value       = azurerm_container_registry.cloudmart_acr.login_server
}

output "acr_admin_username" {
  description = "The admin username for the Container Registry"
  value       = azurerm_container_registry.cloudmart_acr.admin_username
  sensitive   = true
}

output "aks_cluster_name" {
  description = "The name of the AKS cluster"
  value       = azurerm_kubernetes_cluster.cloudmart_aks.name
}

output "aks_kube_config" {
  description = "Kubeconfig file contents for the AKS cluster"
  value       = azurerm_kubernetes_cluster.cloudmart_aks.kube_config_raw
  sensitive   = true
}
