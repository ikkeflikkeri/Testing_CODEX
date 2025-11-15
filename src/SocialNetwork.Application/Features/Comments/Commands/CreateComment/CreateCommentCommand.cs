using MediatR;
using SocialNetwork.Shared.DTOs;

namespace SocialNetwork.Application.Features.Comments.Commands.CreateComment;

public record CreateCommentCommand(CreateCommentDto Data, Guid UserId) : IRequest<CommentDto>;
