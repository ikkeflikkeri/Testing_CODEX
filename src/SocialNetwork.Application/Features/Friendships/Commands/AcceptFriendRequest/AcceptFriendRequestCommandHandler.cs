using MediatR;
using SocialNetwork.Application.Common.Exceptions;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Domain.Enums;
using SocialNetwork.Domain.Interfaces;

namespace SocialNetwork.Application.Features.Friendships.Commands.AcceptFriendRequest;

public class AcceptFriendRequestCommandHandler : IRequestHandler<AcceptFriendRequestCommand, Unit>
{
    private readonly IRepository<Friendship> _friendshipRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AcceptFriendRequestCommandHandler(
        IRepository<Friendship> friendshipRepository,
        IUnitOfWork unitOfWork)
    {
        _friendshipRepository = friendshipRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(AcceptFriendRequestCommand request, CancellationToken cancellationToken)
    {
        var friendship = await _friendshipRepository.GetByIdAsync(request.FriendshipId, cancellationToken);

        if (friendship == null)
            throw new NotFoundException(nameof(Friendship), request.FriendshipId);

        // Verify the user is the addressee
        if (friendship.AddresseeId != request.UserId)
            throw new UnauthorizedException("You can only accept friend requests sent to you");

        if (friendship.Status != FriendshipStatus.Pending)
            throw new InvalidOperationException("This friend request has already been processed");

        friendship.Status = FriendshipStatus.Accepted;
        await _friendshipRepository.UpdateAsync(friendship, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
