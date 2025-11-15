using FluentValidation;
using SocialNetwork.Application.Common.Exceptions;
using System.Net;
using System.Text.Json;

namespace SocialNetwork.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "An unhandled exception occurred");

        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = new
        {
            message = exception.Message,
            statusCode = (int)HttpStatusCode.InternalServerError,
            details = (string?)null
        };

        switch (exception)
        {
            case ValidationException validationException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse = new
                {
                    message = "Validation failed",
                    statusCode = (int)HttpStatusCode.BadRequest,
                    details = string.Join(", ", validationException.Errors.Select(e => e.ErrorMessage))
                };
                break;

            case NotFoundException:
                response.StatusCode = (int)HttpStatusCode.NotFound;
                errorResponse = new
                {
                    message = exception.Message,
                    statusCode = (int)HttpStatusCode.NotFound,
                    details = (string?)null
                };
                break;

            case UnauthorizedException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse = new
                {
                    message = exception.Message,
                    statusCode = (int)HttpStatusCode.Unauthorized,
                    details = (string?)null
                };
                break;

            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                errorResponse = new
                {
                    message = "An internal server error occurred",
                    statusCode = (int)HttpStatusCode.InternalServerError,
                    details = exception.Message
                };
                break;
        }

        await response.WriteAsync(JsonSerializer.Serialize(errorResponse));
    }
}
