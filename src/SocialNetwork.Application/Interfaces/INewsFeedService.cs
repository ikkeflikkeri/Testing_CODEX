using SocialNetwork.Shared.DTOs;

namespace SocialNetwork.Application.Interfaces;

public interface INewsFeedService
{
    Task<List<PostDto>> GetPersonalizedFeedAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken);
    Task<double> CalculatePostScoreAsync(Guid userId, Guid postId, CancellationToken cancellationToken);
    Task RegenerateFeedAsync(Guid userId, CancellationToken cancellationToken);
}
