using MediatR;
using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Application.Features.Likes.Commands.LikePost;

public record LikePostCommand(Guid PostId, Guid UserId, ReactionType ReactionType) : IRequest<Unit>;
