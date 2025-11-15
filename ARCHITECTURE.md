# Social Networking Platform Architecture

## Technology Stack

### Core Framework
- **ASP.NET Core 10.0** (Experimental/Preview)
- **C# 13** with latest language features
- **.NET 10 Runtime**

### Architecture Pattern
- **Hybrid Clean Architecture + Vertical Slice Architecture**
  - Clean Architecture for core domain logic and infrastructure
  - Vertical Slices for feature organization
  - CQRS pattern for command/query separation

### Data Layer
- **Entity Framework Core 10.0** with SQL Server
- **Redis** for distributed caching and session management
- **First-level and Second-level caching** strategies

### Real-time Communication
- **SignalR Core** for real-time messaging and notifications
- WebSockets with fallback support

### Security
- **ASP.NET Core Identity** for authentication
- **JWT Bearer Tokens** for API authentication
- **OAuth 2.0** support for social login
- **OWASP Top 10** security measures implemented

### API & Documentation
- **Minimal APIs** with endpoint filters
- **OpenAPI/Swagger** for documentation
- **MediatR** for CQRS implementation

### Monitoring & Logging
- **Serilog** for structured logging
- **Health Checks** for system monitoring
- **Application Insights** integration ready

## Architecture Layers

### 1. Domain Layer (Core)
- **Entities**: User, Post, Comment, Like, Message, Friendship, etc.
- **Value Objects**: Email, PhoneNumber, Privacy settings
- **Domain Events**: UserRegistered, PostCreated, MessageSent
- **Interfaces**: Repository contracts
- **Domain Services**: Business logic

### 2. Application Layer (Use Cases)
Organized by **Vertical Slices** (Features):

#### User Management
- Registration & Authentication
- Profile Management
- Account Settings
- Privacy Controls

#### Social Connections
- Friend Requests (Send, Accept, Reject)
- Friend Management
- Connection Suggestions
- Blocking/Unblocking

#### Content Management
- Post Creation (Text, Images, Videos)
- Post Editing & Deletion
- Post Sharing
- Privacy Controls per Post

#### Engagement
- Comments (Create, Edit, Delete)
- Likes/Reactions
- Comment Threading
- Notifications

#### News Feed
- Personalized Feed Algorithm
- Feed Ranking (Engagement-based, Time-based, Friend-based)
- Real-time Updates
- Infinite Scroll Support

#### Messaging
- Direct Messages
- Group Chats
- Message Threading
- Read Receipts
- Typing Indicators
- Real-time Delivery

### 3. Infrastructure Layer
- **Persistence**: EF Core DbContext, Repositories
- **Caching**: Redis implementation
- **Email**: SMTP service
- **File Storage**: Azure Blob Storage / Local storage
- **External APIs**: Third-party integrations

### 4. Presentation Layer
- **API Controllers**: RESTful endpoints
- **SignalR Hubs**: Real-time communication
- **DTOs**: Data transfer objects
- **Validators**: FluentValidation
- **Filters**: Authorization, Exception handling

## Database Schema

### Core Tables

#### Users
- Id (GUID)
- Email (unique, encrypted)
- Username (unique)
- PasswordHash
- FirstName, LastName
- DateOfBirth
- Bio
- ProfilePictureUrl
- CoverPhotoUrl
- IsEmailVerified
- IsActive
- CreatedAt, UpdatedAt
- LastLoginAt

#### UserProfiles
- UserId (FK)
- PhoneNumber
- Location
- Website
- PrivacySettings (JSON)
- NotificationSettings (JSON)

#### Friendships
- Id
- RequesterId (FK to Users)
- AddresseeId (FK to Users)
- Status (Pending, Accepted, Rejected, Blocked)
- CreatedAt, UpdatedAt

#### Posts
- Id (GUID)
- UserId (FK)
- Content (Text)
- MediaUrls (JSON array)
- PrivacyLevel (Public, Friends, Private, Custom)
- IsEdited
- CreatedAt, UpdatedAt
- DeletedAt (Soft delete)

#### Comments
- Id (GUID)
- PostId (FK)
- UserId (FK)
- ParentCommentId (FK, nullable - for threading)
- Content
- IsEdited
- CreatedAt, UpdatedAt
- DeletedAt

#### Likes
- Id
- UserId (FK)
- TargetId (Post or Comment)
- TargetType (Post, Comment)
- ReactionType (Like, Love, Haha, Wow, Sad, Angry)
- CreatedAt

#### Messages
- Id (GUID)
- ConversationId (FK)
- SenderId (FK to Users)
- Content
- MessageType (Text, Image, File)
- MediaUrl
- IsRead
- IsDelivered
- CreatedAt, UpdatedAt
- DeletedAt

#### Conversations
- Id (GUID)
- Type (Direct, Group)
- Title (for groups)
- CreatedAt, UpdatedAt

#### ConversationParticipants
- ConversationId (FK)
- UserId (FK)
- JoinedAt
- LastReadAt
- IsAdmin (for groups)

#### Notifications
- Id (GUID)
- UserId (FK)
- Type (FriendRequest, Like, Comment, Message, etc.)
- Content
- SourceUserId (FK)
- RelatedEntityId
- IsRead
- CreatedAt

#### FeedItems (Materialized View/Cache)
- UserId (FK)
- PostId (FK)
- Score (for ranking)
- GeneratedAt

## Security Features

### Authentication & Authorization
- **Password Security**: PBKDF2 with individual salts
- **JWT Tokens**: Short-lived access tokens + refresh tokens
- **Multi-Factor Authentication (MFA)**: Optional TOTP
- **Session Management**: Redis-backed sessions
- **OAuth 2.0**: Google, Facebook, Twitter integration

### Data Protection
- **HTTPS Enforcement**: All traffic over TLS 1.3
- **CORS Configuration**: Strict origin policies
- **Data Encryption**:
  - At rest: Transparent Data Encryption (TDE)
  - In transit: TLS 1.3
  - Sensitive fields: AES-256 encryption

### Input Validation & Sanitization
- **FluentValidation**: All DTOs validated
- **HTML Sanitization**: Prevent XSS attacks
- **SQL Injection Protection**: Parameterized queries, EF Core
- **File Upload Validation**: Type, size, content checking

### Rate Limiting
- **Per-IP Rate Limiting**: AspNetCoreRateLimit
- **Per-User Rate Limiting**: API throttling
- **DDoS Protection**: Cloudflare/Azure Front Door ready

### OWASP Top 10 Protection
1. **Broken Access Control**: Role-based + Resource-based authorization
2. **Cryptographic Failures**: Strong encryption, secure key management
3. **Injection**: Parameterized queries, input validation
4. **Insecure Design**: Threat modeling, security by design
5. **Security Misconfiguration**: Secure defaults, hardened configuration
6. **Vulnerable Components**: Dependency scanning, regular updates
7. **Authentication Failures**: Strong password policy, MFA, session management
8. **Software Integrity Failures**: Code signing, dependency verification
9. **Logging Failures**: Comprehensive audit logging
10. **SSRF**: URL validation, whitelist approach

### Additional Security
- **CSRF Protection**: Anti-forgery tokens
- **Content Security Policy (CSP)**: XSS prevention
- **Security Headers**: HSTS, X-Frame-Options, etc.
- **Secrets Management**: Azure Key Vault integration
- **Audit Logging**: All sensitive operations logged

## News Feed Algorithm

### Ranking Factors
1. **Recency**: Time decay function
2. **Engagement**: Likes, comments, shares weighted
3. **Friendship Strength**: Interaction history
4. **Content Type**: User preferences
5. **Relevance**: ML-based scoring (future)

### Implementation
- **Background Processing**: Feed generation via background jobs
- **Caching**: Redis cache for personalized feeds
- **Real-time Updates**: SignalR push for new content
- **Pagination**: Cursor-based for infinite scroll

## Performance Optimizations

### Caching Strategy
- **Query Plan Caching**: EF Core built-in
- **First-level Cache**: DbContext lifetime
- **Second-level Cache**: Redis distributed cache
- **Response Caching**: HTTP cache headers
- **Output Caching**: Page-level caching

### Database Optimization
- **Indexing**: Strategic indexes on foreign keys, search fields
- **Compiled Queries**: For frequently executed queries
- **AsNoTracking**: Read-only queries
- **Stored Procedures**: Complex operations
- **Connection Pooling**: Configured appropriately

### API Optimization
- **Compression**: Gzip/Brotli response compression
- **Minimal APIs**: Reduced overhead
- **Async/Await**: Throughout application
- **Lazy Loading**: Disabled (explicit loading instead)

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: Session state in Redis
- **Load Balancing**: Ready for multiple instances
- **Distributed Caching**: Redis cluster
- **Database Replication**: Read replicas for queries

### Monitoring
- **Health Checks**: Database, Redis, external services
- **Metrics**: Response times, error rates
- **Logging**: Structured logging with Serilog
- **Alerting**: Integration with monitoring tools

## Project Structure

```
SocialNetwork/
├── src/
│   ├── SocialNetwork.Domain/              # Core domain entities, interfaces
│   ├── SocialNetwork.Application/         # Use cases, vertical slices
│   │   ├── Features/
│   │   │   ├── Users/
│   │   │   ├── Posts/
│   │   │   ├── Comments/
│   │   │   ├── Messages/
│   │   │   ├── Friendships/
│   │   │   └── NewsFeed/
│   │   ├── Common/
│   │   └── Interfaces/
│   ├── SocialNetwork.Infrastructure/      # Data access, external services
│   ├── SocialNetwork.API/                 # Web API, SignalR hubs
│   └── SocialNetwork.Shared/              # Shared DTOs, constants
├── tests/
│   ├── SocialNetwork.UnitTests/
│   ├── SocialNetwork.IntegrationTests/
│   └── SocialNetwork.ArchitectureTests/
└── docs/
```

## API Endpoints (RESTful)

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

### Users
- GET /api/users/me
- PUT /api/users/me
- GET /api/users/{id}
- GET /api/users/search
- PUT /api/users/me/privacy
- PUT /api/users/me/password

### Friendships
- GET /api/friendships
- POST /api/friendships/request
- PUT /api/friendships/{id}/accept
- PUT /api/friendships/{id}/reject
- DELETE /api/friendships/{id}
- GET /api/friendships/suggestions

### Posts
- GET /api/posts
- GET /api/posts/{id}
- POST /api/posts
- PUT /api/posts/{id}
- DELETE /api/posts/{id}
- POST /api/posts/{id}/share

### Comments
- GET /api/posts/{postId}/comments
- POST /api/posts/{postId}/comments
- PUT /api/comments/{id}
- DELETE /api/comments/{id}

### Likes
- POST /api/posts/{postId}/like
- DELETE /api/posts/{postId}/like
- POST /api/comments/{commentId}/like
- DELETE /api/comments/{commentId}/like

### Messages
- GET /api/conversations
- GET /api/conversations/{id}
- POST /api/conversations
- POST /api/conversations/{id}/messages
- GET /api/conversations/{id}/messages
- PUT /api/messages/{id}/read

### News Feed
- GET /api/feed
- GET /api/feed/refresh

### Notifications
- GET /api/notifications
- PUT /api/notifications/{id}/read
- PUT /api/notifications/read-all

## SignalR Hubs

### ChatHub
- SendMessage(conversationId, message)
- TypingIndicator(conversationId, userId)
- MarkAsRead(messageId)
- JoinConversation(conversationId)
- LeaveConversation(conversationId)

### NotificationHub
- OnNotificationReceived(notification)
- OnFriendRequestReceived(request)

### FeedHub
- OnNewPost(post)
- OnPostUpdate(postId, update)

## Deployment

### Development
- Docker Compose for local development
- SQL Server container
- Redis container

### Production
- Azure App Service / AKS
- Azure SQL Database
- Azure Cache for Redis
- Azure Blob Storage
- Azure Key Vault
- Application Insights

## Future Enhancements
- [ ] Machine Learning for feed ranking
- [ ] Video calling integration
- [ ] Stories feature
- [ ] Events and groups
- [ ] Marketplace
- [ ] Analytics dashboard
- [ ] Mobile app (MAUI)
