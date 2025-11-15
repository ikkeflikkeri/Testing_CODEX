using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class Friendship : BaseEntity
{
    public Guid RequesterId { get; set; }
    public Guid AddresseeId { get; set; }
    public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;

    // Navigation properties
    public virtual User Requester { get; set; } = null!;
    public virtual User Addressee { get; set; } = null!;
}
