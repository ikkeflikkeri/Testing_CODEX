using MediatR;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Domain.Enums;
using SocialNetwork.Domain.Interfaces;
using SocialNetwork.Shared.DTOs;
using System.Text.Json;

namespace SocialNetwork.Application.Features.Posts.Commands.CreatePost;

public class CreatePostCommandHandler : IRequestHandler<CreatePostCommand, PostDto>
{
    private readonly IRepository<Post> _postRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePostCommandHandler(IRepository<Post> postRepository, IUnitOfWork unitOfWork)
    {
        _postRepository = postRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PostDto> Handle(CreatePostCommand request, CancellationToken cancellationToken)
    {
        var privacyLevel = Enum.Parse<PrivacyLevel>(request.Data.PrivacyLevel);

        var post = new Post
        {
            UserId = request.UserId,
            Content = request.Data.Content,
            MediaUrls = request.Data.MediaUrls != null && request.Data.MediaUrls.Any()
                ? JsonSerializer.Serialize(request.Data.MediaUrls)
                : null,
            PrivacyLevel = privacyLevel
        };

        await _postRepository.AddAsync(post, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO (simplified - in production use AutoMapper)
        return new PostDto(
            post.Id,
            post.UserId,
            string.Empty, // Would be populated from User entity
            string.Empty,
            null,
            post.Content,
            request.Data.MediaUrls,
            request.Data.PrivacyLevel,
            false,
            0,
            0,
            0,
            false,
            post.CreatedAt,
            post.UpdatedAt,
            null,
            null
        );
    }
}
