#!/bin/bash

# Azure Deployment Script for Social Network Platform
# Usage: ./deploy-azure.sh <environment> <resource-group> <app-name>

set -e

ENVIRONMENT=${1:-staging}
RESOURCE_GROUP=${2:-socialnetwork-rg}
APP_NAME=${3:-socialnetwork-api}
LOCATION="eastus"
SQL_SERVER_NAME="socialnetwork-sql-${ENVIRONMENT}"
SQL_DATABASE_NAME="SocialNetworkDB"
REDIS_NAME="socialnetwork-redis-${ENVIRONMENT}"
APP_SERVICE_PLAN="socialnetwork-plan-${ENVIRONMENT}"
KEY_VAULT_NAME="socialnetwork-kv-${ENVIRONMENT}"

echo "=== Deploying Social Network to Azure ==="
echo "Environment: ${ENVIRONMENT}"
echo "Resource Group: ${RESOURCE_GROUP}"
echo "App Name: ${APP_NAME}"

# Create resource group
echo "Creating resource group..."
az group create --name ${RESOURCE_GROUP} --location ${LOCATION}

# Create App Service Plan
echo "Creating App Service Plan..."
az appservice plan create \
  --name ${APP_SERVICE_PLAN} \
  --resource-group ${RESOURCE_GROUP} \
  --sku B1 \
  --is-linux

# Create Web App
echo "Creating Web App..."
az webapp create \
  --name ${APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --plan ${APP_SERVICE_PLAN} \
  --runtime "DOTNETCORE:9.0"

# Create SQL Server
echo "Creating SQL Server..."
az sql server create \
  --name ${SQL_SERVER_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --location ${LOCATION} \
  --admin-user sqladmin \
  --admin-password "$(openssl rand -base64 32)"

# Create SQL Database
echo "Creating SQL Database..."
az sql db create \
  --name ${SQL_DATABASE_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --server ${SQL_SERVER_NAME} \
  --service-objective S0

# Create Azure Cache for Redis
echo "Creating Redis Cache..."
az redis create \
  --name ${REDIS_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --location ${LOCATION} \
  --sku Basic \
  --vm-size c0

# Create Key Vault
echo "Creating Key Vault..."
az keyvault create \
  --name ${KEY_VAULT_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --location ${LOCATION}

# Get connection strings
SQL_CONNECTION_STRING=$(az sql db show-connection-string \
  --server ${SQL_SERVER_NAME} \
  --name ${SQL_DATABASE_NAME} \
  --client ado.net \
  --output tsv)

REDIS_CONNECTION_STRING=$(az redis list-keys \
  --name ${REDIS_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --query primaryKey \
  --output tsv)

# Configure app settings
echo "Configuring app settings..."
az webapp config appsettings set \
  --name ${APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --settings \
    "ConnectionStrings__DefaultConnection=${SQL_CONNECTION_STRING}" \
    "ConnectionStrings__Redis=${REDIS_NAME}.redis.cache.windows.net:6380,password=${REDIS_CONNECTION_STRING},ssl=True,abortConnect=False" \
    "ASPNETCORE_ENVIRONMENT=${ENVIRONMENT^}" \
    "KeyVaultName=${KEY_VAULT_NAME}"

# Enable managed identity
echo "Enabling managed identity..."
az webapp identity assign \
  --name ${APP_NAME} \
  --resource-group ${RESOURCE_GROUP}

# Deploy application
echo "Deploying application..."
dotnet publish src/SocialNetwork.API/SocialNetwork.API.csproj \
  --configuration Release \
  --output ./publish

cd publish && zip -r ../app.zip . && cd ..

az webapp deployment source config-zip \
  --name ${APP_NAME} \
  --resource-group ${RESOURCE_GROUP} \
  --src app.zip

echo "=== Deployment Complete ==="
echo "App URL: https://${APP_NAME}.azurewebsites.net"
echo "Please update your DNS settings to point to this URL"
