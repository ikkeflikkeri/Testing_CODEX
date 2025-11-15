using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class Post : BaseEntity
{
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? MediaUrls { get; set; } // JSON array of URLs
    public PrivacyLevel PrivacyLevel { get; set; } = PrivacyLevel.Public;
    public bool IsEdited { get; set; }
    public Guid? SharedFromPostId { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public int ShareCount { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Post? SharedFromPost { get; set; }
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<Like> Likes { get; set; } = new List<Like>();
    public virtual ICollection<Post> Shares { get; set; } = new List<Post>();
}
