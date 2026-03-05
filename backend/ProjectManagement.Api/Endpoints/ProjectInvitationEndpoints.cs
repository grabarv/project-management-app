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
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var result = await service.GetReceivedAsync(currentUserId);
            return Results.Ok(result);
        });

        invitations.MapGet("/projects/{projectId:int}/invitations", async (
            int projectId,
            HttpContext httpContext,
            IProjectInvitationService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var result = await service.GetForProjectAsync(projectId, currentUserId);
            return result.Success ? Results.Ok(result.Value) : result.ToHttpError();
        });

        invitations.MapPost("/projects/{projectId:int}/invitations", async (
            int projectId,
            CreateProjectInvitationRequest request,
            HttpContext httpContext,
            IProjectInvitationService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            if (string.IsNullOrWhiteSpace(request.InvitedUsername))
            {
                return Results.BadRequest(new { message = "InvitedUsername is required" });
            }

            var result = await service.CreateAsync(projectId, request, currentUserId);
            return result.Success
                ? Results.Created($"/api/project-invitations/{result.Value!.Id}", result.Value)
                : result.ToHttpError();
        });

        invitations.MapPost("/project-invitations/{id:int}/accept", async (
            int id,
            HttpContext httpContext,
            IProjectInvitationService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var result = await service.AcceptAsync(id, currentUserId);
            return result.Success ? Results.Ok(result.Value) : result.ToHttpError();
        });

        invitations.MapPost("/project-invitations/{id:int}/decline", async (
            int id,
            HttpContext httpContext,
            IProjectInvitationService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var result = await service.DeclineAsync(id, currentUserId);
            return result.Success ? Results.Ok(result.Value) : result.ToHttpError();
        });

        invitations.MapDelete("/project-invitations/{id:int}", async (
            int id,
            HttpContext httpContext,
            IProjectInvitationService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var result = await service.CancelAsync(id, currentUserId);
            return result.Success ? Results.Ok(result.Value) : result.ToHttpError();
        });

        return app;
    }
}
