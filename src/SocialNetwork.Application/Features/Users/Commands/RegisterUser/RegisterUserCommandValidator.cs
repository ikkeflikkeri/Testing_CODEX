using FluentValidation;

namespace SocialNetwork.Application.Features.Users.Commands.RegisterUser;

public class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator()
    {
        RuleFor(x => x.Data.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.Data.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one number")
            .Matches(@"[\W]").WithMessage("Password must contain at least one special character");

        RuleFor(x => x.Data.FirstName)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.Data.LastName)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.Data.UserName)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(30)
            .Matches(@"^[a-zA-Z0-9_]+$").WithMessage("Username can only contain letters, numbers, and underscores");
    }
}
