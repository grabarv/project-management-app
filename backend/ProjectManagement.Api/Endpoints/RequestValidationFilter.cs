using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Endpoints;

/// <summary>
/// Validates request DTOs using DataAnnotations before endpoint handlers execute.
/// </summary>
public sealed class RequestValidationFilter<TRequest> : IEndpointFilter where TRequest : class
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next)
    {
        var request = context.Arguments.OfType<TRequest>().FirstOrDefault();
        if (request is null)
        {
            return await next(context);
        }

        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(request);
        var isValid = Validator.TryValidateObject(
            request,
            validationContext,
            validationResults,
            validateAllProperties: true);

        if (isValid)
        {
            return await next(context);
        }

        var firstMessage = validationResults
            .Select(item => item.ErrorMessage)
            .FirstOrDefault(message => !string.IsNullOrWhiteSpace(message))
            ?? "Request validation failed";

        var errors = validationResults
            .SelectMany(result =>
                result.MemberNames.DefaultIfEmpty("request"),
                (result, memberName) => new
                {
                    MemberName = string.IsNullOrWhiteSpace(memberName) ? "request" : memberName,
                    result.ErrorMessage
                })
            .Where(item => !string.IsNullOrWhiteSpace(item.ErrorMessage))
            .GroupBy(item => item.MemberName)
            .ToDictionary(
                group => group.Key,
                group => group.Select(item => item.ErrorMessage!).ToArray());

        return Results.BadRequest(new
        {
            message = firstMessage,
            errors
        });
    }
}
