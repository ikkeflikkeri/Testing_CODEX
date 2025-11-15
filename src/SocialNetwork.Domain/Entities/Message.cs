using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class Message : BaseEntity
{
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; } = string.Empty;
    public MessageType MessageType { get; set; } = MessageType.Text;
    public string? MediaUrl { get; set; }
    public bool IsRead { get; set; }
    public bool IsDelivered { get; set; }
    public DateTime? ReadAt { get; set; }

    // Navigation properties
    public virtual Conversation Conversation { get; set; } = null!;
    public virtual User Sender { get; set; } = null!;
}
