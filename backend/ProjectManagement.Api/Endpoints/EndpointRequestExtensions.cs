using ProjectManagement.Api.Services;

namespace ProjectManagement.Api.Endpoints;

/// <summary>
/// Shared helpers for endpoint request parsing and API error mapping.
/// </summary>
public static class EndpointRequestExtensions
{
    public static bool TryResolveCurrentUserId(this HttpContext httpContext, out int userId, out IResult? errorResult)
    {
        userId = 0;
        errorResult = null;

        if (!httpContext.Request.Headers.TryGetValue("X-User-Id", out var rawUserId))
        {
            errorResult = Results.BadRequest(new { message = "X-User-Id header is required" });
            return false;
        }

        if (!int.TryParse(rawUserId, out userId) || userId <= 0)
        {
            errorResult = Results.BadRequest(new { message = "X-User-Id header is invalid" });
            return false;
        }

        return true;
    }

    public static IResult ToHttpError<T>(this OperationResult<T> result)
    {
        return result.StatusCode switch
        {
            400 => Results.BadRequest(new { message = result.Error }),
            403 => Results.Json(
                new { message = result.Error ?? "You do not have permission to perform this action" },
                statusCode: StatusCodes.Status403Forbidden),
            404 => Results.NotFound(new { message = result.Error }),
            _ => Results.StatusCode(result.StatusCode)
        };
    }
}
