namespace SocialNetwork.Shared.DTOs;

public record RegisterUserDto(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string UserName,
    DateTime? DateOfBirth
);

public record LoginDto(string Email, string Password);

public record TokenResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt
);

public record UserDto(
    Guid Id,
    string Email,
    string UserName,
    string FirstName,
    string LastName,
    string FullName,
    DateTime? DateOfBirth,
    string? Bio,
    string? ProfilePictureUrl,
    string? CoverPhotoUrl,
    DateTime CreatedAt
);

public record UpdateUserProfileDto(
    string? FirstName,
    string? LastName,
    DateTime? DateOfBirth,
    string? Bio,
    string? PhoneNumber,
    string? Location,
    string? Website
);

public record PrivacySettingsDto(
    string ProfileVisibility,
    string PostsVisibility,
    string FriendsListVisibility,
    bool AllowFriendRequests,
    bool AllowMessagesFromNonFriends
);
