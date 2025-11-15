using MediatR;

namespace SocialNetwork.Application.Features.Friendships.Commands.AcceptFriendRequest;

public record AcceptFriendRequestCommand(Guid FriendshipId, Guid UserId) : IRequest<Unit>;
