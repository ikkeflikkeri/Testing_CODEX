namespace SocialNetwork.Application.Common.Exceptions;

public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message)
        : base(message)
    {
    }

    public UnauthorizedException()
        : base("Unauthorized access.")
    {
    }
}
