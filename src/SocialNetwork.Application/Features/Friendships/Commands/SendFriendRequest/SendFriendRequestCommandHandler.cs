using MediatR;
using SocialNetwork.Application.Common.Exceptions;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Domain.Enums;
using SocialNetwork.Domain.Interfaces;

namespace SocialNetwork.Application.Features.Friendships.Commands.SendFriendRequest;

public class SendFriendRequestCommandHandler : IRequestHandler<SendFriendRequestCommand, Guid>
{
    private readonly IRepository<Friendship> _friendshipRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SendFriendRequestCommandHandler(
        IRepository<Friendship> friendshipRepository,
        IRepository<User> userRepository,
        IUnitOfWork unitOfWork)
    {
        _friendshipRepository = friendshipRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(SendFriendRequestCommand request, CancellationToken cancellationToken)
    {
        // Validate users exist
        var requester = await _userRepository.GetByIdAsync(request.RequesterId, cancellationToken);
        if (requester == null)
            throw new NotFoundException(nameof(User), request.RequesterId);

        var addressee = await _userRepository.GetByIdAsync(request.AddresseeId, cancellationToken);
        if (addressee == null)
            throw new NotFoundException(nameof(User), request.AddresseeId);

        // Check if friendship already exists
        var existingFriendship = await _friendshipRepository.FirstOrDefaultAsync(
            f => (f.RequesterId == request.RequesterId && f.AddresseeId == request.AddresseeId) ||
                 (f.RequesterId == request.AddresseeId && f.AddresseeId == request.RequesterId),
            cancellationToken);

        if (existingFriendship != null)
            throw new InvalidOperationException("Friendship request already exists or users are already friends");

        var friendship = new Friendship
        {
            RequesterId = request.RequesterId,
            AddresseeId = request.AddresseeId,
            Status = FriendshipStatus.Pending
        };

        await _friendshipRepository.AddAsync(friendship, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return friendship.Id;
    }
}
