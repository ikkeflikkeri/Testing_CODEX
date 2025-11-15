using MediatR;

namespace SocialNetwork.Application.Features.Friendships.Commands.SendFriendRequest;

public record SendFriendRequestCommand(Guid RequesterId, Guid AddresseeId) : IRequest<Guid>;
