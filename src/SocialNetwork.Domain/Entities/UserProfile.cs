namespace SocialNetwork.Domain.Entities;

public class UserProfile
{
    public Guid UserId { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Location { get; set; }
    public string? Website { get; set; }
    public string? PrivacySettings { get; set; } // JSON string
    public string? NotificationSettings { get; set; } // JSON string
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
}
