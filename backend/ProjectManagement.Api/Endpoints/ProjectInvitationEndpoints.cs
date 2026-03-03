using ProjectManagement.Api.Contracts.ProjectInvitations;
using ProjectManagement.Api.Services;

namespace ProjectManagement.Api.Endpoints;

public static class ProjectInvitationEndpoints
{
    /// <summary>
    /// Maps endpoints for sending and responding to project invitations.
    /// </summary>
    public static IEndpointRouteBuilder MapProjectInvitationEndpoints(this IEndpointRouteBuilder app)
    {
        var invitations = app.MapGroup("/api");

        invitations.MapGet("/project-invitations/received", async (
            HttpContext httpContext,
            IProjectInvitationService service) =>
        {
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            var result = await service.GetReceivedAsync(currentUserResult.Value);
            return Results.Ok(result);
        });

        invitations.MapGet("/projects/{projectId:int}/invitations", async (
            int projectId,
            HttpContext httpContext,
            IProjectInvitationService service) =>
        {
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            var result = await service.GetForProjectAsync(projectId, currentUserResult.Value);
            return result.Success ? Results.Ok(result.Value) : ToHttpError(result);
        });

        invitations.MapPost("/projects/{projectId:int}/invitations", async (
            int projectId,
            CreateProjectInvitationRequest request,
            HttpContext httpContext,
            IProjectInvitationService service) =>
        {
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            if (string.IsNullOrWhiteSpace(request.InvitedUsername))
            {
                return Results.BadRequest(new { message = "InvitedUsername is required" });
            }

            var result = await service.CreateAsync(projectId, request, currentUserResult.Value);
            return result.Success
                ? Results.Created($"/api/project-invitations/{result.Value!.Id}", result.Value)
                : ToHttpError(result);
        });

        invitations.MapPost("/project-invitations/{id:int}/accept", async (
            int id,
            HttpContext httpContext,
            IProjectInvitationService service) =>
        {
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            var result = await service.AcceptAsync(id, currentUserResult.Value);
            return result.Success ? Results.Ok(result.Value) : ToHttpError(result);
        });

        invitations.MapPost("/project-invitations/{id:int}/decline", async (
            int id,
            HttpContext httpContext,
            IProjectInvitationService service) =>
        {
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            var result = await service.DeclineAsync(id, currentUserResult.Value);
            return result.Success ? Results.Ok(result.Value) : ToHttpError(result);
        });

        invitations.MapDelete("/project-invitations/{id:int}", async (
            int id,
            HttpContext httpContext,
            IProjectInvitationService service) =>
        {
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            var result = await service.CancelAsync(id, currentUserResult.Value);
            return result.Success ? Results.Ok(result.Value) : ToHttpError(result);
        });

        return app;
    }

    private static IResult ToHttpError<T>(OperationResult<T> result)
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

    private static CurrentUserResolutionResult TryGetCurrentUserId(HttpContext httpContext)
    {
        if (!httpContext.Request.Headers.TryGetValue("X-User-Id", out var rawUserId))
        {
            return CurrentUserResolutionResult.Fail(
                Results.BadRequest(new { message = "X-User-Id header is required" }));
        }

        if (!int.TryParse(rawUserId, out var currentUserId) || currentUserId <= 0)
        {
            return CurrentUserResolutionResult.Fail(
                Results.BadRequest(new { message = "X-User-Id header is invalid" }));
        }

        return CurrentUserResolutionResult.Ok(currentUserId);
    }

    private sealed record CurrentUserResolutionResult(bool Success, int Value, IResult? ErrorResult)
    {
        public static CurrentUserResolutionResult Ok(int userId) => new(true, userId, null);
        public static CurrentUserResolutionResult Fail(IResult errorResult) => new(false, 0, errorResult);
    }
}
