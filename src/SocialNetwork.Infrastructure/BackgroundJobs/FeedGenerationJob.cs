using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Enums;
using SocialNetwork.Infrastructure.Persistence;

namespace SocialNetwork.Infrastructure.BackgroundJobs;

public class FeedGenerationJob
{
    private readonly ApplicationDbContext _context;
    private readonly INewsFeedService _newsFeedService;
    private readonly ILogger<FeedGenerationJob> _logger;

    public FeedGenerationJob(
        ApplicationDbContext context,
        INewsFeedService newsFeedService,
        ILogger<FeedGenerationJob> logger)
    {
        _context = context;
        _newsFeedService = newsFeedService;
        _logger = logger;
    }

    public async Task RegenerateAllFeedsAsync()
    {
        _logger.LogInformation("Starting feed regeneration job");

        try
        {
            // Get all active users
            var activeUsers = await _context.Users
                .Where(u => u.IsActive)
                .Select(u => u.Id)
                .ToListAsync();

            _logger.LogInformation("Regenerating feeds for {UserCount} users", activeUsers.Count);

            foreach (var userId in activeUsers)
            {
                try
                {
                    await _newsFeedService.RegenerateFeedAsync(userId, CancellationToken.None);
                    _logger.LogDebug("Feed regenerated for user {UserId}", userId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error regenerating feed for user {UserId}", userId);
                }
            }

            _logger.LogInformation("Feed regeneration job completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in feed regeneration job");
            throw;
        }
    }

    public async Task CleanupOldFeedItemsAsync()
    {
        _logger.LogInformation("Starting feed cleanup job");

        try
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-30);

            var oldItems = await _context.FeedItems
                .Where(f => f.GeneratedAt < cutoffDate)
                .ToListAsync();

            _context.FeedItems.RemoveRange(oldItems);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Cleaned up {Count} old feed items", oldItems.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in feed cleanup job");
            throw;
        }
    }

    public async Task UpdateEngagementMetricsAsync()
    {
        _logger.LogInformation("Starting engagement metrics update");

        try
        {
            // Update post engagement counts
            var posts = await _context.Posts
                .Where(p => !p.IsDeleted)
                .ToListAsync();

            foreach (var post in posts)
            {
                post.LikeCount = await _context.Likes.CountAsync(l => l.PostId == post.Id);
                post.CommentCount = await _context.Comments.CountAsync(c => c.PostId == post.Id && !c.IsDeleted);
                post.ShareCount = await _context.Posts.CountAsync(p => p.SharedFromPostId == post.Id && !p.IsDeleted);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated engagement metrics for {Count} posts", posts.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating engagement metrics");
            throw;
        }
    }
}
