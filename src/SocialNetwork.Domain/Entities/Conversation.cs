using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class Conversation : BaseEntity
{
    public ConversationType Type { get; set; } = ConversationType.Direct;
    public string? Title { get; set; }
    public Guid? LastMessageId { get; set; }

    // Navigation properties
    public virtual ICollection<ConversationParticipant> Participants { get; set; } = new List<ConversationParticipant>();
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
    public virtual Message? LastMessage { get; set; }
}
