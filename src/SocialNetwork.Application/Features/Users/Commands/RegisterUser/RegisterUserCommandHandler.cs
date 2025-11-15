using MediatR;
using Microsoft.AspNetCore.Identity;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Shared.DTOs;

namespace SocialNetwork.Application.Features.Users.Commands.RegisterUser;

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, TokenResponseDto>
{
    private readonly UserManager<User> _userManager;
    private readonly ITokenService _tokenService;

    public RegisterUserCommandHandler(UserManager<User> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<TokenResponseDto> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            Email = request.Data.Email,
            UserName = request.Data.UserName,
            FirstName = request.Data.FirstName,
            LastName = request.Data.LastName,
            DateOfBirth = request.Data.DateOfBirth,
            EmailConfirmed = false,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, request.Data.Password);

        if (!result.Succeeded)
        {
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        var tokens = await _tokenService.GenerateTokensAsync(user);

        return tokens;
    }
}
