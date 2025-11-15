using SocialNetwork.Domain.Entities;
using SocialNetwork.Shared.DTOs;

namespace SocialNetwork.Application.Interfaces;

public interface ITokenService
{
    Task<TokenResponseDto> GenerateTokensAsync(User user);
    Task<TokenResponseDto> RefreshTokenAsync(string refreshToken);
}
