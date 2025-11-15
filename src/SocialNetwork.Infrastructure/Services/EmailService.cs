using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SocialNetwork.Application.Interfaces;
using System.Net;
using System.Net.Mail;

namespace SocialNetwork.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        _smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
        _smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
        _smtpUsername = _configuration["Email:SmtpUsername"] ?? "";
        _smtpPassword = _configuration["Email:SmtpPassword"] ?? "";
        _fromEmail = _configuration["Email:FromEmail"] ?? "noreply@socialnetwork.com";
        _fromName = _configuration["Email:FromName"] ?? "Social Network";
    }

    public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true, CancellationToken cancellationToken = default)
    {
        try
        {
            using var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                Credentials = new NetworkCredential(_smtpUsername, _smtpPassword),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_fromEmail, _fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = isHtml
            };

            mailMessage.To.Add(to);

            await client.SendMailAsync(mailMessage, cancellationToken);

            _logger.LogInformation("Email sent successfully to {To} with subject: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email to {To}", to);
            throw;
        }
    }

    public async Task SendPasswordResetEmailAsync(string to, string resetToken, CancellationToken cancellationToken = default)
    {
        var resetUrl = $"{_configuration["AppUrl"]}/reset-password?token={resetToken}";
        var body = $@"
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password. Click the link below to proceed:</p>
            <p><a href='{resetUrl}'>Reset Password</a></p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 24 hours.</p>
        ";

        await SendEmailAsync(to, "Password Reset Request", body, true, cancellationToken);
    }

    public async Task SendEmailConfirmationAsync(string to, string confirmationToken, CancellationToken cancellationToken = default)
    {
        var confirmUrl = $"{_configuration["AppUrl"]}/confirm-email?token={confirmationToken}";
        var body = $@"
            <h2>Confirm Your Email</h2>
            <p>Thank you for registering! Please confirm your email address by clicking the link below:</p>
            <p><a href='{confirmUrl}'>Confirm Email</a></p>
            <p>If you didn't create an account, please ignore this email.</p>
        ";

        await SendEmailAsync(to, "Confirm Your Email", body, true, cancellationToken);
    }

    public async Task SendWelcomeEmailAsync(string to, string userName, CancellationToken cancellationToken = default)
    {
        var body = $@"
            <h2>Welcome to Social Network!</h2>
            <p>Hi {userName},</p>
            <p>Thank you for joining our community! We're excited to have you here.</p>
            <p>Get started by:</p>
            <ul>
                <li>Completing your profile</li>
                <li>Finding friends</li>
                <li>Sharing your first post</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
        ";

        await SendEmailAsync(to, "Welcome to Social Network!", body, true, cancellationToken);
    }

    public async Task SendNotificationEmailAsync(string to, string notificationType, string content, CancellationToken cancellationToken = default)
    {
        var subject = $"New {notificationType}";
        var body = $@"
            <h2>New Notification</h2>
            <p>{content}</p>
            <p><a href='{_configuration["AppUrl"]}'>View on Social Network</a></p>
        ";

        await SendEmailAsync(to, subject, body, true, cancellationToken);
    }
}
