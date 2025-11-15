using Microsoft.EntityFrameworkCore;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Domain.Enums;
using SocialNetwork.Infrastructure.Persistence;
using SocialNetwork.Shared.DTOs;

namespace SocialNetwork.Infrastructure.Services;

public class NewsFeedService : INewsFeedService
{
    private readonly ApplicationDbContext _context;

    public NewsFeedService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PostDto>> GetPersonalizedFeedAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken)
    {
        // Get user's friends
        var friendIds = await _context.Friendships
            .Where(f => (f.RequesterId == userId || f.AddresseeId == userId) && f.Status == FriendshipStatus.Accepted)
            .Select(f => f.RequesterId == userId ? f.AddresseeId : f.RequesterId)
            .ToListAsync(cancellationToken);

        // Include user's own posts
        friendIds.Add(userId);

        // Get posts with ranking
        var posts = await _context.Posts
            .Where(p => friendIds.Contains(p.UserId))
            .Include(p => p.User)
            .OrderByDescending(p => CalculateScore(p))
            .ThenByDescending(p => p.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PostDto(
                p.Id,
                p.UserId,
                p.User.UserName!,
                p.User.FullName,
                p.User.ProfilePictureUrl,
                p.Content,
                p.MediaUrls != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(p.MediaUrls) : null,
                p.PrivacyLevel.ToString(),
                p.IsEdited,
                p.LikeCount,
                p.CommentCount,
                p.ShareCount,
                false, // Would check if current user liked
                p.CreatedAt,
                p.UpdatedAt,
                p.SharedFromPostId,
                null
            ))
            .ToListAsync(cancellationToken);

        return posts;
    }

    public async Task<double> CalculatePostScoreAsync(Guid userId, Guid postId, CancellationToken cancellationToken)
    {
        var post = await _context.Posts.FindAsync(new object[] { postId }, cancellationToken);
        if (post == null) return 0;

        return CalculateScore(post);
    }

    private double CalculateScore(Post post)
    {
        // Scoring algorithm
        var recencyScore = CalculateRecencyScore(post.CreatedAt);
        var engagementScore = (post.LikeCount * 1.0) + (post.CommentCount * 2.0) + (post.ShareCount * 3.0);

        return (recencyScore * 0.4) + (engagementScore * 0.6);
    }

    private double CalculateRecencyScore(DateTime createdAt)
    {
        var hoursSincePosted = (DateTime.UtcNow - createdAt).TotalHours;
        return Math.Max(0, 100 - hoursSincePosted); // Decay over time
    }

    public async Task RegenerateFeedAsync(Guid userId, CancellationToken cancellationToken)
    {
        // Remove old feed items
        var oldItems = await _context.FeedItems
            .Where(f => f.UserId == userId)
            .ToListAsync(cancellationToken);
        _context.FeedItems.RemoveRange(oldItems);

        // Generate new feed items
        var posts = await GetPersonalizedFeedAsync(userId, 1, 100, cancellationToken);

        var feedItems = posts.Select(p => new FeedItem
        {
            UserId = userId,
            PostId = p.Id,
            Score = CalculateRecencyScore(p.CreatedAt)
        });

        await _context.FeedItems.AddRangeAsync(feedItems, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
