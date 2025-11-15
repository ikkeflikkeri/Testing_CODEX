namespace SocialNetwork.Shared.DTOs;

public record CreatePostDto(
    string Content,
    List<string>? MediaUrls,
    string PrivacyLevel
);

public record UpdatePostDto(
    string Content,
    string PrivacyLevel
);

public record PostDto(
    Guid Id,
    Guid UserId,
    string UserName,
    string UserFullName,
    string? UserProfilePictureUrl,
    string Content,
    List<string>? MediaUrls,
    string PrivacyLevel,
    bool IsEdited,
    int LikeCount,
    int CommentCount,
    int ShareCount,
    bool IsLikedByCurrentUser,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    Guid? SharedFromPostId,
    PostDto? SharedFromPost
);

public record SharePostDto(Guid PostId, string? AdditionalContent);
