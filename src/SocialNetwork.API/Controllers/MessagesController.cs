using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Shared.DTOs;
using System.Security.Claims;

namespace SocialNetwork.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet("conversations")]
    public async Task<ActionResult<List<ConversationDto>>> GetConversations()
    {
        // Implement GetConversationsQuery
        return Ok(new List<ConversationDto>());
    }

    [HttpPost("conversations")]
    public async Task<ActionResult<ConversationDto>> CreateConversation([FromBody] CreateConversationDto dto)
    {
        // Implement CreateConversationCommand
        return Ok();
    }

    [HttpGet("conversations/{id}")]
    public async Task<ActionResult<ConversationDto>> GetConversation(Guid id)
    {
        // Implement GetConversationQuery
        return Ok();
    }

    [HttpGet("conversations/{id}/messages")]
    public async Task<ActionResult<List<MessageDto>>> GetMessages(Guid id, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50)
    {
        // Implement GetMessagesQuery
        return Ok(new List<MessageDto>());
    }

    [HttpPost("conversations/{id}/messages")]
    public async Task<ActionResult<MessageDto>> SendMessage(Guid id, [FromBody] SendMessageDto dto)
    {
        // Implement SendMessageCommand
        return Ok();
    }

    [HttpPut("messages/{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        // Implement MarkMessageAsReadCommand
        return NoContent();
    }
}
