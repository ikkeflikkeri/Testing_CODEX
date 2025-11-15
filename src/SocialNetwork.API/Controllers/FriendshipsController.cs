using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Shared.DTOs;
using System.Security.Claims;

namespace SocialNetwork.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FriendshipsController : ControllerBase
{
    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet]
    public async Task<ActionResult<List<FriendDto>>> GetFriends()
    {
        // Implement GetFriendsQuery
        return Ok(new List<FriendDto>());
    }

    [HttpPost("request")]
    public async Task<IActionResult> SendFriendRequest([FromBody] SendFriendRequestDto dto)
    {
        // Implement SendFriendRequestCommand
        return Ok();
    }

    [HttpPut("{id}/accept")]
    public async Task<IActionResult> AcceptFriendRequest(Guid id)
    {
        // Implement AcceptFriendRequestCommand
        return NoContent();
    }

    [HttpPut("{id}/reject")]
    public async Task<IActionResult> RejectFriendRequest(Guid id)
    {
        // Implement RejectFriendRequestCommand
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveFriend(Guid id)
    {
        // Implement RemoveFriendCommand
        return NoContent();
    }

    [HttpGet("suggestions")]
    public async Task<ActionResult<List<UserDto>>> GetFriendSuggestions()
    {
        // Implement GetFriendSuggestionsQuery
        return Ok(new List<UserDto>());
    }

    [HttpGet("requests")]
    public async Task<ActionResult<List<FriendshipDto>>> GetFriendRequests()
    {
        // Implement GetFriendRequestsQuery
        return Ok(new List<FriendshipDto>());
    }
}
