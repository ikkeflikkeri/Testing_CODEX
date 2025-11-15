using MediatR;
using Microsoft.EntityFrameworkCore;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Shared.DTOs;

namespace SocialNetwork.Application.Features.Posts.Queries.GetNewsFeed;

public class GetNewsFeedQueryHandler : IRequestHandler<GetNewsFeedQuery, List<PostDto>>
{
    private readonly INewsFeedService _newsFeedService;

    public GetNewsFeedQueryHandler(INewsFeedService newsFeedService)
    {
        _newsFeedService = newsFeedService;
    }

    public async Task<List<PostDto>> Handle(GetNewsFeedQuery request, CancellationToken cancellationToken)
    {
        return await _newsFeedService.GetPersonalizedFeedAsync(
            request.UserId,
            request.PageNumber,
            request.PageSize,
            cancellationToken
        );
    }
}
