namespace SocialNetwork.Shared.DTOs;

public record SendFriendRequestDto(Guid AddresseeId);

public record FriendshipDto(
    Guid Id,
    Guid RequesterId,
    Guid AddresseeId,
    string Status,
    UserDto Requester,
    UserDto Addressee,
    DateTime CreatedAt
);

public record FriendDto(
    Guid UserId,
    string UserName,
    string FullName,
    string? ProfilePictureUrl,
    DateTime FriendsSince
);
