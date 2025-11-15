using MediatR;
using SocialNetwork.Shared.DTOs;

namespace SocialNetwork.Application.Features.Users.Commands.RegisterUser;

public record RegisterUserCommand(RegisterUserDto Data) : IRequest<TokenResponseDto>;
