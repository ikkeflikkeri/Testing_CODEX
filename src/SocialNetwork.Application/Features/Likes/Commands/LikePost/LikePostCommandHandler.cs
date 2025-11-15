using MediatR;
using SocialNetwork.Application.Common.Exceptions;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Domain.Interfaces;

namespace SocialNetwork.Application.Features.Likes.Commands.LikePost;

public class LikePostCommandHandler : IRequestHandler<LikePostCommand, Unit>
{
    private readonly IRepository<Like> _likeRepository;
    private readonly IRepository<Post> _postRepository;
    private readonly IUnitOfWork _unitOfWork;

    public LikePostCommandHandler(
        IRepository<Like> likeRepository,
        IRepository<Post> postRepository,
        IUnitOfWork unitOfWork)
    {
        _likeRepository = likeRepository;
        _postRepository = postRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(LikePostCommand request, CancellationToken cancellationToken)
    {
        var post = await _postRepository.GetByIdAsync(request.PostId, cancellationToken);
        if (post == null)
            throw new NotFoundException(nameof(Post), request.PostId);

        // Check if already liked
        var existingLike = await _likeRepository.FirstOrDefaultAsync(
            l => l.PostId == request.PostId && l.UserId == request.UserId,
            cancellationToken);

        if (existingLike != null)
        {
            // Update reaction type if different
            if (existingLike.ReactionType != request.ReactionType)
            {
                existingLike.ReactionType = request.ReactionType;
                await _likeRepository.UpdateAsync(existingLike, cancellationToken);
            }
        }
        else
        {
            // Create new like
            var like = new Like
            {
                PostId = request.PostId,
                UserId = request.UserId,
                ReactionType = request.ReactionType
            };

            await _likeRepository.AddAsync(like, cancellationToken);

            // Update post like count
            post.LikeCount++;
            await _postRepository.UpdateAsync(post, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
