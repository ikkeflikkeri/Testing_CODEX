using MediatR;
using SocialNetwork.Application.Common.Exceptions;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Domain.Interfaces;
using SocialNetwork.Shared.DTOs;

namespace SocialNetwork.Application.Features.Comments.Commands.CreateComment;

public class CreateCommentCommandHandler : IRequestHandler<CreateCommentCommand, CommentDto>
{
    private readonly IRepository<Comment> _commentRepository;
    private readonly IRepository<Post> _postRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCommentCommandHandler(
        IRepository<Comment> commentRepository,
        IRepository<Post> postRepository,
        IUnitOfWork unitOfWork)
    {
        _commentRepository = commentRepository;
        _postRepository = postRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CommentDto> Handle(CreateCommentCommand request, CancellationToken cancellationToken)
    {
        // Verify post exists
        var post = await _postRepository.GetByIdAsync(request.Data.PostId, cancellationToken);
        if (post == null)
            throw new NotFoundException(nameof(Post), request.Data.PostId);

        // Verify parent comment exists if specified
        if (request.Data.ParentCommentId.HasValue)
        {
            var parentComment = await _commentRepository.GetByIdAsync(request.Data.ParentCommentId.Value, cancellationToken);
            if (parentComment == null)
                throw new NotFoundException(nameof(Comment), request.Data.ParentCommentId.Value);
        }

        var comment = new Comment
        {
            PostId = request.Data.PostId,
            UserId = request.UserId,
            ParentCommentId = request.Data.ParentCommentId,
            Content = request.Data.Content
        };

        await _commentRepository.AddAsync(comment, cancellationToken);

        // Update post comment count
        post.CommentCount++;
        await _postRepository.UpdateAsync(post, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CommentDto(
            comment.Id,
            comment.PostId,
            comment.UserId,
            string.Empty, // Would be populated from User entity
            string.Empty,
            null,
            comment.Content,
            false,
            0,
            0,
            false,
            comment.ParentCommentId,
            comment.CreatedAt,
            comment.UpdatedAt
        );
    }
}
