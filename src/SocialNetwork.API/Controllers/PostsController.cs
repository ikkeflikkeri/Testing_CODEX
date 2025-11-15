using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Application.Features.Posts.Commands.CreatePost;
using SocialNetwork.Application.Features.Posts.Queries.GetNewsFeed;
using SocialNetwork.Shared.DTOs;
using System.Security.Claims;

namespace SocialNetwork.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PostsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim!);
    }

    [HttpGet]
    public async Task<ActionResult<List<PostDto>>> GetPosts([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        var query = new GetNewsFeedQuery(userId, pageNumber, pageSize);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<PostDto>> CreatePost([FromBody] CreatePostDto dto)
    {
        var userId = GetCurrentUserId();
        var command = new CreatePostCommand(dto, userId);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetPost), new { id = result.Id }, result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PostDto>> GetPost(Guid id)
    {
        // Implement GetPostQuery
        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpdatePostDto dto)
    {
        // Implement UpdatePostCommand
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        // Implement DeletePostCommand (soft delete)
        return NoContent();
    }

    [HttpPost("{id}/like")]
    public async Task<IActionResult> LikePost(Guid id, [FromBody] string reactionType = "Like")
    {
        // Implement LikePostCommand
        return Ok();
    }

    [HttpDelete("{id}/like")]
    public async Task<IActionResult> UnlikePost(Guid id)
    {
        // Implement UnlikePostCommand
        return NoContent();
    }

    [HttpPost("{id}/share")]
    public async Task<ActionResult<PostDto>> SharePost(Guid id, [FromBody] SharePostDto dto)
    {
        // Implement SharePostCommand
        return Ok();
    }
}
