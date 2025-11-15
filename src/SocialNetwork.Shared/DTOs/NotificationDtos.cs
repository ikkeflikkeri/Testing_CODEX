namespace SocialNetwork.Shared.DTOs;

public record NotificationDto(
    Guid Id,
    string Type,
    string Content,
    Guid? SourceUserId,
    string? SourceUserName,
    string? SourceUserProfilePictureUrl,
    Guid? RelatedEntityId,
    bool IsRead,
    DateTime CreatedAt
);
