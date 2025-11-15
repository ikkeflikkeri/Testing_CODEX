using FluentAssertions;
using Moq;
using SocialNetwork.Application.Common.Exceptions;
using SocialNetwork.Application.Features.Friendships.Commands.SendFriendRequest;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Domain.Enums;
using SocialNetwork.Domain.Interfaces;
using Xunit;

namespace SocialNetwork.UnitTests.Application.Features.Friendships;

public class SendFriendRequestCommandHandlerTests
{
    private readonly Mock<IRepository<Friendship>> _friendshipRepoMock;
    private readonly Mock<IRepository<User>> _userRepoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly SendFriendRequestCommandHandler _handler;

    public SendFriendRequestCommandHandlerTests()
    {
        _friendshipRepoMock = new Mock<IRepository<Friendship>>();
        _userRepoMock = new Mock<IRepository<User>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();

        _handler = new SendFriendRequestCommandHandler(
            _friendshipRepoMock.Object,
            _userRepoMock.Object,
            _unitOfWorkMock.Object
        );
    }

    [Fact]
    public async Task Handle_ValidRequest_ShouldCreateFriendshipRequest()
    {
        // Arrange
        var requesterId = Guid.NewGuid();
        var addresseeId = Guid.NewGuid();
        var command = new SendFriendRequestCommand(requesterId, addresseeId);

        var requester = new User { Id = requesterId, UserName = "user1" };
        var addressee = new User { Id = addresseeId, UserName = "user2" };

        _userRepoMock.Setup(x => x.GetByIdAsync(requesterId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(requester);
        _userRepoMock.Setup(x => x.GetByIdAsync(addresseeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(addressee);

        _friendshipRepoMock.Setup(x => x.FirstOrDefaultAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Friendship, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Friendship?)null);

        _friendshipRepoMock.Setup(x => x.AddAsync(It.IsAny<Friendship>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Friendship f, CancellationToken ct) => f);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeEmpty();
        _friendshipRepoMock.Verify(x => x.AddAsync(
            It.Is<Friendship>(f =>
                f.RequesterId == requesterId &&
                f.AddresseeId == addresseeId &&
                f.Status == FriendshipStatus.Pending
            ),
            It.IsAny<CancellationToken>()
        ), Times.Once);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_RequesterNotFound_ShouldThrowNotFoundException()
    {
        // Arrange
        var command = new SendFriendRequestCommand(Guid.NewGuid(), Guid.NewGuid());

        _userRepoMock.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_FriendshipAlreadyExists_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var requesterId = Guid.NewGuid();
        var addresseeId = Guid.NewGuid();
        var command = new SendFriendRequestCommand(requesterId, addresseeId);

        _userRepoMock.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new User { Id = Guid.NewGuid() });

        var existingFriendship = new Friendship
        {
            RequesterId = requesterId,
            AddresseeId = addresseeId,
            Status = FriendshipStatus.Pending
        };

        _friendshipRepoMock.Setup(x => x.FirstOrDefaultAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Friendship, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingFriendship);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
    }
}
