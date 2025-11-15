using MediatR;
using SocialNetwork.Shared.DTOs;

namespace SocialNetwork.Application.Features.Posts.Commands.CreatePost;

public record CreatePostCommand(CreatePostDto Data, Guid UserId) : IRequest<PostDto>;
