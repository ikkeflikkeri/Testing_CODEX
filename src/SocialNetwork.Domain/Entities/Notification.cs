using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public NotificationType Type { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid? SourceUserId { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public bool IsRead { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual User? SourceUser { get; set; }
}
