namespace SocialNetwork.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, bool isHtml = true, CancellationToken cancellationToken = default);
    Task SendPasswordResetEmailAsync(string to, string resetToken, CancellationToken cancellationToken = default);
    Task SendEmailConfirmationAsync(string to, string confirmationToken, CancellationToken cancellationToken = default);
    Task SendWelcomeEmailAsync(string to, string userName, CancellationToken cancellationToken = default);
    Task SendNotificationEmailAsync(string to, string notificationType, string content, CancellationToken cancellationToken = default);
}
