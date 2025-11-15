namespace SocialNetwork.Shared.DTOs;

public record SendMessageDto(
    Guid ConversationId,
    string Content,
    string MessageType,
    string? MediaUrl
);

public record CreateConversationDto(
    List<Guid> ParticipantIds,
    string? Title,
    string ConversationType
);

public record ConversationDto(
    Guid Id,
    string Type,
    string? Title,
    List<ParticipantDto> Participants,
    MessageDto? LastMessage,
    int UnreadCount,
    DateTime CreatedAt
);

public record ParticipantDto(
    Guid UserId,
    string UserName,
    string FullName,
    string? ProfilePictureUrl,
    bool IsAdmin
);

public record MessageDto(
    Guid Id,
    Guid ConversationId,
    Guid SenderId,
    string SenderName,
    string? SenderProfilePictureUrl,
    string Content,
    string MessageType,
    string? MediaUrl,
    bool IsRead,
    DateTime CreatedAt
);
