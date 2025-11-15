namespace SocialNetwork.Domain.Entities;

/// <summary>
/// Materialized view for personalized news feed
/// </summary>
public class FeedItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid PostId { get; set; }
    public double Score { get; set; } // Ranking score
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Post Post { get; set; } = null!;
}
