using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SocialNetwork.API.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public async Task SendNotification(Guid userId, object notification)
    {
        await Clients.User(userId.ToString()).SendAsync("ReceiveNotification", notification);
    }

    public async Task SendFriendRequest(Guid userId, object request)
    {
        await Clients.User(userId.ToString()).SendAsync("FriendRequestReceived", request);
    }

    public async Task NotifyLike(Guid userId, object likeInfo)
    {
        await Clients.User(userId.ToString()).SendAsync("PostLiked", likeInfo);
    }

    public async Task NotifyComment(Guid userId, object commentInfo)
    {
        await Clients.User(userId.ToString()).SendAsync("CommentReceived", commentInfo);
    }
}
