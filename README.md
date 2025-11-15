# Social Networking Platform

A comprehensive, enterprise-grade social networking platform built with ASP.NET Core 9.0 (experimental .NET 10 architecture patterns), featuring user profiles, friend connections, post creation and sharing, real-time messaging, news feed algorithm, and comprehensive security features.

## 🏗️ Architecture

This project implements a **Hybrid Clean Architecture + Vertical Slice Architecture** approach:

- **Clean Architecture** for domain logic and infrastructure
- **Vertical Slices** for feature organization (CQRS with MediatR)
- **Domain-Driven Design** principles
- **SOLID** principles throughout

### Technology Stack

- **Framework**: ASP.NET Core 9.0 with .NET 10 experimental features
- **Language**: C# 13 with preview features
- **Database**: SQL Server with Entity Framework Core 9.0
- **Caching**: Redis (StackExchange.Redis)
- **Real-time**: SignalR for WebSocket communication
- **Authentication**: ASP.NET Identity with JWT Bearer tokens
- **Validation**: FluentValidation
- **API Documentation**: Swagger/OpenAPI
- **Logging**: Serilog
- **Containerization**: Docker & Docker Compose

## 🚀 Features

### User Management
- ✅ User registration and authentication (JWT)
- ✅ Profile management with privacy controls
- ✅ Password reset functionality
- ✅ Multi-factor authentication support (configurable)
- ✅ Role-based and resource-based authorization

### Social Features
- ✅ Friend connections (send, accept, reject, block)
- ✅ Friend suggestions algorithm
- ✅ User search and discovery
- ✅ Privacy levels (Public, Friends, Private, Custom)

### Content Management
- ✅ Post creation with text and media
- ✅ Post editing and deletion (soft delete)
- ✅ Post sharing/reposting
- ✅ Privacy controls per post
- ✅ Comments with threading support
- ✅ Reactions/Likes (multiple reaction types)

### Messaging System
- ✅ Direct messaging (1-on-1)
- ✅ Group conversations
- ✅ Real-time message delivery via SignalR
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Message history with pagination

### News Feed
- ✅ Personalized feed algorithm
- ✅ Ranking based on:
  - Recency (time decay)
  - Engagement (likes, comments, shares)
  - Friendship strength
  - Content type preferences
- ✅ Real-time feed updates
- ✅ Infinite scroll with cursor-based pagination

### Notifications
- ✅ Real-time notifications via SignalR
- ✅ Notification types:
  - Friend requests
  - Likes and reactions
  - Comments
  - Messages
  - Mentions

## 🔒 Security Features

### OWASP Top 10 Protection

All OWASP Top 10 vulnerabilities are addressed. See ARCHITECTURE.md for detailed security implementation.

### Additional Security Measures

- **Rate Limiting**: Per-IP and per-user rate limiting
- **CSRF Protection**: Anti-forgery tokens
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Data Encryption**: TLS 1.3, database encryption
- **SQL Injection Protection**: EF Core parameterized queries
- **XSS Protection**: HTML sanitization on all inputs

## 📁 Project Structure

```
SocialNetwork/
├── src/
│   ├── SocialNetwork.Domain/          # Core domain entities, interfaces
│   ├── SocialNetwork.Application/     # Use cases, CQRS handlers
│   ├── SocialNetwork.Infrastructure/  # Data access, external services
│   ├── SocialNetwork.API/             # Web API, SignalR hubs
│   └── SocialNetwork.Shared/          # Shared DTOs, constants
├── tests/
├── docs/
├── Dockerfile
├── docker-compose.yml
└── ARCHITECTURE.md
```

## 🚀 Getting Started

### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

This will start:
- The API on http://localhost:5000
- SQL Server on localhost:1433
- Redis on localhost:6379

### Manual Setup

1. Update connection strings in `appsettings.json`
2. Run migrations: `dotnet ef database update`
3. Run: `dotnet run --project src/SocialNetwork.API`

### Access the API

- Swagger UI: http://localhost:5000/swagger
- Health Check: http://localhost:5000/health
- API Base: http://localhost:5000/api

## 📡 API Endpoints

See full API documentation in ARCHITECTURE.md or via Swagger UI.

### Key Endpoints
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/posts` - Get news feed
- `POST /api/posts` - Create post
- `GET /api/friendships` - Get friends
- `POST /api/messages/conversations` - Start conversation

## 🔌 SignalR Hubs

- **ChatHub** (`/hubs/chat`) - Real-time messaging
- **NotificationHub** (`/hubs/notifications`) - Real-time notifications

## 📊 Performance & Security

- Redis distributed caching
- Database query optimization
- Rate limiting & throttling
- Comprehensive input validation
- HTML sanitization
- JWT authentication
- HTTPS enforcement

## 📝 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed architecture and design decisions
- [Swagger UI](http://localhost:5000/swagger) - Interactive API documentation

## 🛡️ Security

This platform implements comprehensive security measures following OWASP best practices. All user inputs are validated and sanitized. See ARCHITECTURE.md for details.

## 🗺️ Roadmap

- [ ] Machine Learning for feed ranking
- [ ] Video calling
- [ ] Stories feature
- [ ] Events and groups
- [ ] Mobile app (MAUI)

## 📞 Support

Open an issue in the repository for support.

---

Built with ❤️ using ASP.NET Core 9.0 and modern architectural patterns