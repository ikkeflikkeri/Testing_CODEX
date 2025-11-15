# API Usage Examples

This document provides comprehensive examples of how to use the Social Network API.

## Table of Contents
- [Authentication](#authentication)
- [User Management](#user-management)
- [Posts](#posts)
- [Comments](#comments)
- [Friendships](#friendships)
- [Messages](#messages)
- [SignalR Real-time](#signalr-real-time)

## Authentication

### Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "userName": "johndoe",
    "dateOfBirth": "1990-01-15"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "AbCdEf123...",
  "expiresAt": "2025-11-15T10:00:00Z"
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

### Using the Access Token

Include the token in subsequent requests:

```bash
curl -X GET http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## User Management

### Get Current User Profile

```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Profile

```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Software developer and tech enthusiast",
    "location": "San Francisco, CA",
    "website": "https://johndoe.com"
  }'
```

### Update Privacy Settings

```bash
curl -X PUT http://localhost:5000/api/users/me/privacy \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profileVisibility": "Friends",
    "postsVisibility": "Public",
    "friendsListVisibility": "Private",
    "allowFriendRequests": true,
    "allowMessagesFromNonFriends": false
  }'
```

## Posts

### Create a Post

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Just had an amazing day at the beach! 🌊",
    "mediaUrls": [
      "https://example.com/images/beach1.jpg",
      "https://example.com/images/beach2.jpg"
    ],
    "privacyLevel": "Public"
  }'
```

### Get News Feed

```bash
curl -X GET "http://localhost:5000/api/posts?pageNumber=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "987e6543-e21b-12d3-a456-426614174000",
    "userName": "johndoe",
    "userFullName": "John Doe",
    "userProfilePictureUrl": "https://example.com/profiles/johndoe.jpg",
    "content": "Just had an amazing day at the beach! 🌊",
    "mediaUrls": [
      "https://example.com/images/beach1.jpg"
    ],
    "privacyLevel": "Public",
    "isEdited": false,
    "likeCount": 42,
    "commentCount": 15,
    "shareCount": 3,
    "isLikedByCurrentUser": true,
    "createdAt": "2025-11-15T08:30:00Z",
    "updatedAt": "2025-11-15T08:30:00Z",
    "sharedFromPostId": null,
    "sharedFromPost": null
  }
]
```

### Like a Post

```bash
curl -X POST http://localhost:5000/api/posts/{postId}/like \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '"Like"'
```

Reaction types: `Like`, `Love`, `Haha`, `Wow`, `Sad`, `Angry`

### Share a Post

```bash
curl -X POST http://localhost:5000/api/posts/{postId}/share \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "123e4567-e89b-12d3-a456-426614174000",
    "additionalContent": "This is exactly how I felt today!"
  }'
```

## Comments

### Create a Comment

```bash
curl -X POST http://localhost:5000/api/posts/{postId}/comments \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "123e4567-e89b-12d3-a456-426614174000",
    "content": "Looks like you had a great time!",
    "parentCommentId": null
  }'
```

### Reply to a Comment

```bash
curl -X POST http://localhost:5000/api/posts/{postId}/comments \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "123e4567-e89b-12d3-a456-426614174000",
    "content": "Thanks! It was awesome!",
    "parentCommentId": "456e7890-e12b-34d5-a678-901234567890"
  }'
```

## Friendships

### Send Friend Request

```bash
curl -X POST http://localhost:5000/api/friendships/request \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addresseeId": "987e6543-e21b-12d3-a456-426614174000"
  }'
```

### Accept Friend Request

```bash
curl -X PUT http://localhost:5000/api/friendships/{friendshipId}/accept \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Friends List

```bash
curl -X GET http://localhost:5000/api/friendships \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Friend Suggestions

```bash
curl -X GET http://localhost:5000/api/friendships/suggestions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Messages

### Create a Conversation

```bash
curl -X POST http://localhost:5000/api/messages/conversations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantIds": [
      "987e6543-e21b-12d3-a456-426614174000"
    ],
    "title": null,
    "conversationType": "Direct"
  }'
```

### Send a Message

```bash
curl -X POST http://localhost:5000/api/messages/conversations/{conversationId}/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "abc12345-d678-90ef-1234-567890abcdef",
    "content": "Hey! How are you doing?",
    "messageType": "Text",
    "mediaUrl": null
  }'
```

### Get Conversation Messages

```bash
curl -X GET "http://localhost:5000/api/messages/conversations/{conversationId}/messages?pageNumber=1&pageSize=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## SignalR Real-time

### JavaScript Client Example

```javascript
import * as signalR from "@microsoft/signalr";

// Connect to Chat Hub
const chatConnection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/hubs/chat", {
        accessTokenFactory: () => "YOUR_ACCESS_TOKEN"
    })
    .withAutomaticReconnect()
    .build();

// Handle incoming messages
chatConnection.on("ReceiveMessage", (message) => {
    console.log("New message:", message);
    // Update UI with new message
});

// Handle typing indicator
chatConnection.on("UserTyping", (typingInfo) => {
    console.log(`${typingInfo.userName} is typing...`);
});

// Start connection
await chatConnection.start();

// Join a conversation
await chatConnection.invoke("JoinConversation", conversationId);

// Send a message
await chatConnection.invoke("SendMessage", conversationId, "Hello!");

// Send typing indicator
await chatConnection.invoke("TypingIndicator", conversationId, true);
```

### Notification Hub Example

```javascript
const notificationConnection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/hubs/notifications", {
        accessTokenFactory: () => "YOUR_ACCESS_TOKEN"
    })
    .build();

notificationConnection.on("ReceiveNotification", (notification) => {
    console.log("New notification:", notification);
    showNotification(notification);
});

notificationConnection.on("FriendRequestReceived", (request) => {
    console.log("New friend request from:", request.requester.userName);
});

await notificationConnection.start();
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "message": "Validation failed",
  "statusCode": 400,
  "details": "Email is required, Password must be at least 8 characters"
}
```

Common status codes:
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting

The API implements rate limiting:
- 100 requests per minute per IP
- 1000 requests per hour per IP

Rate limit headers are included in responses:
```
X-Rate-Limit-Limit: 100
X-Rate-Limit-Remaining: 95
X-Rate-Limit-Reset: 1699876543
```

## Pagination

List endpoints support pagination:

```bash
curl -X GET "http://localhost:5000/api/posts?pageNumber=2&pageSize=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Parameters:
- `pageNumber`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 100)

## Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (never in localStorage for sensitive apps)
3. **Refresh tokens before expiration**
4. **Handle rate limiting gracefully** with exponential backoff
5. **Validate input on client-side** before sending
6. **Use proper error handling**
7. **Implement retry logic** for network failures
8. **Monitor API usage** with provided metrics

## SDKs and Libraries

Recommended client libraries:
- **JavaScript/TypeScript**: `@microsoft/signalr`
- **C#**: `Microsoft.AspNetCore.SignalR.Client`
- **Python**: `signalrcore`
- **Java**: `signalr-client-sdk`

For detailed API specifications, visit the Swagger documentation at:
http://localhost:5000/swagger
