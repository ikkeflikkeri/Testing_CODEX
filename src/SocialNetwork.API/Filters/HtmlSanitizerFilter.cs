using Ganss.Xss;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Reflection;

namespace SocialNetwork.API.Filters;

public class HtmlSanitizerFilter : IActionFilter
{
    private readonly HtmlSanitizer _sanitizer;

    public HtmlSanitizerFilter()
    {
        _sanitizer = new HtmlSanitizer();
        _sanitizer.AllowedTags.Clear();
        _sanitizer.AllowedAttributes.Clear();
    }

    public void OnActionExecuting(ActionExecutingContext context)
    {
        foreach (var argument in context.ActionArguments)
        {
            if (argument.Value != null)
            {
                SanitizeObject(argument.Value);
            }
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        // No action needed after execution
    }

    private void SanitizeObject(object obj)
    {
        if (obj == null) return;

        var type = obj.GetType();
        var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.PropertyType == typeof(string) && p.CanWrite);

        foreach (var property in properties)
        {
            var value = property.GetValue(obj) as string;
            if (!string.IsNullOrEmpty(value))
            {
                var sanitized = _sanitizer.Sanitize(value);
                property.SetValue(obj, sanitized);
            }
        }
    }
}
