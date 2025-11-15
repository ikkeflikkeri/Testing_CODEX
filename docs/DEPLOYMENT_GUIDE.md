# Deployment Guide

Complete guide for deploying the Social Network Platform to production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Azure Deployment](#azure-deployment)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### Required Software
- .NET 9.0 SDK or later
- Docker and Docker Compose
- Azure CLI (for Azure deployment)
- kubectl (for Kubernetes deployment)

### Required Services
- SQL Server 2019 or Azure SQL Database
- Redis 7.0 or Azure Cache for Redis
- SMTP Server or SendGrid account
- Azure Blob Storage or AWS S3 (for media files)

## Environment Configuration

### Production appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-sql-server;Database=SocialNetworkDB;User Id=dbuser;Password=SECURE_PASSWORD;Encrypt=True;",
    "Redis": "prod-redis:6379,password=REDIS_PASSWORD,ssl=True,abortConnect=False"
  },
  "Jwt": {
    "Key": "PRODUCTION_SECRET_KEY_AT_LEAST_32_CHARACTERS_LONG",
    "Issuer": "SocialNetworkAPI",
    "Audience": "SocialNetworkClient",
    "ExpiryInMinutes": "60"
  },
  "Email": {
    "SmtpHost": "smtp.sendgrid.net",
    "SmtpPort": "587",
    "SmtpUsername": "apikey",
    "SmtpPassword": "SENDGRID_API_KEY",
    "FromEmail": "noreply@yourdomain.com",
    "FromName": "Social Network"
  },
  "FileStorage": {
    "Provider": "AzureBlob",
    "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=...",
    "ContainerName": "media"
  },
  "IpRateLimiting": {
    "EnableEndpointRateLimiting": true,
    "GeneralRules": [
      {
        "Endpoint": "*",
        "Period": "1m",
        "Limit": 60
      },
      {
        "Endpoint": "*",
        "Period": "1h",
        "Limit": 1000
      }
    ]
  },
  "ApplicationInsights": {
    "ConnectionString": "InstrumentationKey=YOUR_KEY;IngestionEndpoint=..."
  }
}
```

### Environment Variables

```bash
export ASPNETCORE_ENVIRONMENT=Production
export ASPNETCORE_URLS="https://+:443;http://+:80"
export ConnectionStrings__DefaultConnection="Server=..."
export ConnectionStrings__Redis="..."
export Jwt__Key="..."
```

## Database Setup

### 1. Create Database Migration

```bash
cd src/SocialNetwork.API
dotnet ef migrations add InitialCreate \
    --project ../SocialNetwork.Infrastructure \
    --output-dir Persistence/Migrations
```

### 2. Apply Migration to Production

```bash
# Using connection string from environment
dotnet ef database update \
    --project ../SocialNetwork.Infrastructure \
    --startup-project .
```

### 3. Database Backup Strategy

```sql
-- Create automated backup job
USE master;
GO

EXEC sp_add_job @job_name = 'SocialNetworkBackup',
    @enabled = 1,
    @description = 'Daily full backup of SocialNetworkDB';

EXEC sp_add_jobstep @job_name = 'SocialNetworkBackup',
    @step_name = 'Backup Database',
    @command = 'BACKUP DATABASE [SocialNetworkDB] TO DISK = ''C:\Backups\SocialNetworkDB.bak'' WITH INIT';
```

## Azure Deployment

### Option 1: Using Deployment Script

```bash
chmod +x scripts/deploy-azure.sh
./scripts/deploy-azure.sh production socialnetwork-prod-rg socialnetwork-api
```

### Option 2: Manual Azure Deployment

#### 1. Create Resource Group

```bash
az group create --name socialnetwork-rg --location eastus
```

#### 2. Create App Service Plan

```bash
az appservice plan create \
    --name socialnetwork-plan \
    --resource-group socialnetwork-rg \
    --sku P1V2 \
    --is-linux
```

#### 3. Create Web App

```bash
az webapp create \
    --name socialnetwork-api \
    --resource-group socialnetwork-rg \
    --plan socialnetwork-plan \
    --runtime "DOTNETCORE:9.0"
```

#### 4. Create SQL Database

```bash
az sql server create \
    --name socialnetwork-sql \
    --resource-group socialnetwork-rg \
    --location eastus \
    --admin-user sqladmin \
    --admin-password "YourSecurePassword123!"

az sql db create \
    --name SocialNetworkDB \
    --resource-group socialnetwork-rg \
    --server socialnetwork-sql \
    --service-objective S1
```

#### 5. Create Redis Cache

```bash
az redis create \
    --name socialnetwork-redis \
    --resource-group socialnetwork-rg \
    --location eastus \
    --sku Standard \
    --vm-size c1
```

#### 6. Deploy Application

```bash
dotnet publish -c Release -o ./publish
cd publish && zip -r ../deploy.zip . && cd ..
az webapp deployment source config-zip \
    --resource-group socialnetwork-rg \
    --name socialnetwork-api \
    --src deploy.zip
```

## Docker Deployment

### Production Docker Compose

```yaml
version: '3.8'

services:
  api:
    image: socialnetwork-api:latest
    ports:
      - "80:80"
      - "443:443"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=https://+:443;http://+:80
      - ASPNETCORE_Kestrel__Certificates__Default__Path=/app/cert.pfx
      - ASPNETCORE_Kestrel__Certificates__Default__Password=${CERT_PASSWORD}
    volumes:
      - ./cert.pfx:/app/cert.pfx:ro
      - ./logs:/app/logs
    depends_on:
      - sqlserver
      - redis
    restart: unless-stopped

  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=${SQL_SA_PASSWORD}
      - MSSQL_PID=Standard
    volumes:
      - sqlserver_data:/var/opt/mssql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    restart: unless-stopped

volumes:
  sqlserver_data:
  redis_data:
```

### Build and Deploy

```bash
# Build image
docker build -t socialnetwork-api:latest .

# Push to registry
docker tag socialnetwork-api:latest myregistry.azurecr.io/socialnetwork-api:latest
docker push myregistry.azurecr.io/socialnetwork-api:latest

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Kubernetes Deployment

### Kubernetes Manifests

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: socialnetwork-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: socialnetwork-api
  template:
    metadata:
      labels:
        app: socialnetwork-api
    spec:
      containers:
      - name: api
        image: myregistry.azurecr.io/socialnetwork-api:latest
        ports:
        - containerPort: 80
        env:
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
        - name: ConnectionStrings__DefaultConnection
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: connection-string
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: socialnetwork-api
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: socialnetwork-api
```

### Deploy to Kubernetes

```bash
# Create secrets
kubectl create secret generic db-secret \
    --from-literal=connection-string="Server=..."

kubectl create secret generic jwt-secret \
    --from-literal=key="..."

# Deploy
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

## SSL/TLS Configuration

### Generate SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificate locations
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Configure HTTPS in Kestrel

```json
{
  "Kestrel": {
    "Endpoints": {
      "Https": {
        "Url": "https://*:443",
        "Certificate": {
          "Path": "/path/to/fullchain.pem",
          "KeyPath": "/path/to/privkey.pem"
        }
      }
    }
  }
}
```

## Monitoring & Maintenance

### Application Insights Setup

```bash
# Install package
dotnet add package Microsoft.ApplicationInsights.AspNetCore

# Add to Program.cs
builder.Services.AddApplicationInsightsTelemetry();
```

### Health Checks Endpoint

```bash
# Check application health
curl https://yourdomain.com/health

# Response
{
  "status": "Healthy",
  "checks": {
    "database": "Healthy",
    "redis": "Healthy"
  }
}
```

### Logging

```bash
# View logs
docker logs socialnetwork-api -f

# Kubernetes logs
kubectl logs -f deployment/socialnetwork-api
```

### Backup Procedures

```bash
# Database backup
docker exec sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U SA -P ${SQL_SA_PASSWORD} \
    -Q "BACKUP DATABASE SocialNetworkDB TO DISK = '/var/opt/mssql/backup/db.bak'"

# Redis backup
docker exec redis redis-cli --rdb /data/dump.rdb
```

## Performance Tuning

### Connection Pooling

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Min Pool Size=10;Max Pool Size=100;"
  }
}
```

### Response Caching

```csharp
builder.Services.AddResponseCaching();
app.UseResponseCaching();
```

### Compression

```csharp
builder.Services.AddResponseCompression(options =>
{
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});
```

## Troubleshooting

### Common Issues

1. **Database Connection Timeout**
   - Check firewall rules
   - Verify connection string
   - Check SQL Server is running

2. **Redis Connection Failed**
   - Verify Redis password
   - Check Redis is accessible
   - Verify port is open

3. **High Memory Usage**
   - Enable garbage collection settings
   - Check for memory leaks
   - Adjust container memory limits

### Rollback Procedure

```bash
# Azure
az webapp deployment slot swap \
    --resource-group socialnetwork-rg \
    --name socialnetwork-api \
    --slot staging

# Docker
docker-compose -f docker-compose.prod.yml down
docker pull myregistry.azurecr.io/socialnetwork-api:previous-version
docker-compose -f docker-compose.prod.yml up -d

# Kubernetes
kubectl rollout undo deployment/socialnetwork-api
```

## Security Checklist

- [ ] HTTPS enabled and enforced
- [ ] Secrets stored in Azure Key Vault / Kubernetes Secrets
- [ ] Database backups configured
- [ ] Monitoring and alerts set up
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Input validation on all endpoints
- [ ] Authentication required on protected endpoints
- [ ] Regular security updates applied

## Post-Deployment Verification

```bash
# Test health endpoint
curl https://yourdomain.com/health

# Test API
curl https://yourdomain.com/api/posts \
    -H "Authorization: Bearer TOKEN"

# Check SignalR
# Connect to wss://yourdomain.com/hubs/chat

# Monitor logs
tail -f /var/log/socialnetwork/api.log
```

For additional support, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
