using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class Like
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid? PostId { get; set; }
    public Guid? CommentId { get; set; }
    public ReactionType ReactionType { get; set; } = ReactionType.Like;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Post? Post { get; set; }
    public virtual Comment? Comment { get; set; }
}
