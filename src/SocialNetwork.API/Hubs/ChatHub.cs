using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace SocialNetwork.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    public async Task SendMessage(Guid conversationId, string message)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        await Clients.Group(conversationId.ToString()).SendAsync("ReceiveMessage", new
        {
            ConversationId = conversationId,
            SenderId = userId,
            Message = message,
            Timestamp = DateTime.UtcNow
        });
    }

    public async Task JoinConversation(Guid conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId.ToString());
        await Clients.Group(conversationId.ToString()).SendAsync("UserJoined", Context.User?.Identity?.Name);
    }

    public async Task LeaveConversation(Guid conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId.ToString());
        await Clients.Group(conversationId.ToString()).SendAsync("UserLeft", Context.User?.Identity?.Name);
    }

    public async Task TypingIndicator(Guid conversationId, bool isTyping)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = Context.User?.Identity?.Name;

        await Clients.GroupExcept(conversationId.ToString(), Context.ConnectionId)
            .SendAsync("UserTyping", new { UserId = userId, UserName = userName, IsTyping = isTyping });
    }

    public async Task MarkAsRead(Guid messageId)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        await Clients.All.SendAsync("MessageRead", new { MessageId = messageId, UserId = userId });
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        await Clients.All.SendAsync("UserOnline", userId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        await Clients.All.SendAsync("UserOffline", userId);
        await base.OnDisconnectedAsync(exception);
    }
}
