using MediatR;
using SocialNetwork.Shared.DTOs;

namespace SocialNetwork.Application.Features.Posts.Queries.GetNewsFeed;

public record GetNewsFeedQuery(Guid UserId, int PageNumber = 1, int PageSize = 20) : IRequest<List<PostDto>>;
