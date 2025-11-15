using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Moq;
using SocialNetwork.Application.Features.Users.Commands.RegisterUser;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Shared.DTOs;
using Xunit;

namespace SocialNetwork.UnitTests.Application.Features.Users;

public class RegisterUserCommandHandlerTests
{
    private readonly Mock<UserManager<User>> _userManagerMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly RegisterUserCommandHandler _handler;

    public RegisterUserCommandHandlerTests()
    {
        var userStoreMock = new Mock<IUserStore<User>>();
        _userManagerMock = new Mock<UserManager<User>>(
            userStoreMock.Object, null, null, null, null, null, null, null, null);
        _tokenServiceMock = new Mock<ITokenService>();

        _handler = new RegisterUserCommandHandler(_userManagerMock.Object, _tokenServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ValidRequest_ShouldCreateUserAndReturnToken()
    {
        // Arrange
        var registerDto = new RegisterUserDto(
            "test@example.com",
            "Password123!",
            "John",
            "Doe",
            "johndoe",
            new DateTime(1990, 1, 1)
        );
        var command = new RegisterUserCommand(registerDto);

        _userManagerMock
            .Setup(x => x.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);

        var expectedToken = new TokenResponseDto(
            "access_token",
            "refresh_token",
            DateTime.UtcNow.AddHours(1)
        );

        _tokenServiceMock
            .Setup(x => x.GenerateTokensAsync(It.IsAny<User>()))
            .ReturnsAsync(expectedToken);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().Be("access_token");
        result.RefreshToken.Should().Be("refresh_token");

        _userManagerMock.Verify(x => x.CreateAsync(
            It.Is<User>(u =>
                u.Email == registerDto.Email &&
                u.FirstName == registerDto.FirstName &&
                u.LastName == registerDto.LastName
            ),
            registerDto.Password
        ), Times.Once);
    }

    [Fact]
    public async Task Handle_UserCreationFails_ShouldThrowException()
    {
        // Arrange
        var registerDto = new RegisterUserDto(
            "test@example.com",
            "Password123!",
            "John",
            "Doe",
            "johndoe",
            null
        );
        var command = new RegisterUserCommand(registerDto);

        var errors = new[]
        {
            new IdentityError { Description = "Email already exists" }
        };

        _userManagerMock
            .Setup(x => x.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Failed(errors));

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _handler.Handle(command, CancellationToken.None));
    }
}
