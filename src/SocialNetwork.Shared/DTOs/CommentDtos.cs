namespace SocialNetwork.Shared.DTOs;

public record CreateCommentDto(
    Guid PostId,
    string Content,
    Guid? ParentCommentId
);

public record UpdateCommentDto(string Content);

public record CommentDto(
    Guid Id,
    Guid PostId,
    Guid UserId,
    string UserName,
    string UserFullName,
    string? UserProfilePictureUrl,
    string Content,
    bool IsEdited,
    int LikeCount,
    int ReplyCount,
    bool IsLikedByCurrentUser,
    Guid? ParentCommentId,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
