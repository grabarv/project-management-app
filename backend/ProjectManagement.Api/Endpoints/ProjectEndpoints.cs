using ProjectManagement.Api.Contracts.Projects;
using ProjectManagement.Api.Services;

namespace ProjectManagement.Api.Endpoints;

public static class ProjectEndpoints
{
    public static IEndpointRouteBuilder MapProjectEndpoints(this IEndpointRouteBuilder app)
    {
        var projects = app.MapGroup("/api/projects");

        projects.MapGet("/", async (HttpContext httpContext, IProjectService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var allProjects = await service.GetAllAsync(currentUserId);
            return Results.Ok(allProjects);
        });

        projects.MapGet("/{id:int}", async (int id, HttpContext httpContext, IProjectService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var result = await service.GetByIdAsync(id, currentUserId);
            if (!result.Success)
            {
                return result.ToHttpError();
            }

            return Results.Ok(result.Value);
        });

        projects.MapPost("/", async (CreateProjectRequest request, HttpContext httpContext, IProjectService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var validationError = ValidateCreateRequest(request);
            if (validationError is not null)
            {
                return validationError;
            }

            var result = await service.CreateAsync(request, currentUserId);
            if (!result.Success)
            {
                return result.ToHttpError();
            }

            return Results.Created($"/api/projects/{result.Value!.Id}", result.Value);
        });

        projects.MapPut("/{id:int}", async (int id, UpdateProjectRequest request, HttpContext httpContext, IProjectService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var validationError = ValidateUpdateRequest(request);
            if (validationError is not null)
            {
                return validationError;
            }

            var result = await service.UpdateAsync(id, request, currentUserId);
            if (!result.Success)
            {
                return result.ToHttpError();
            }

            return Results.Ok(result.Value);
        });

        projects.MapDelete("/{id:int}", async (int id, HttpContext httpContext, IProjectService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var result = await service.DeleteAsync(id, currentUserId);
            if (!result.Success)
            {
                return result.ToHttpError();
            }

            return Results.NoContent();
        });

        projects.MapDelete(
            "/{projectId:int}/participants/{participantUserId:int}",
            async (int projectId, int participantUserId, HttpContext httpContext, IProjectService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var result = await service.RemoveParticipantAsync(
                projectId,
                participantUserId,
                currentUserId);

            return result.Success ? Results.Ok(result.Value) : result.ToHttpError();
        });

        return app;
    }

    private static IResult? ValidateCreateRequest(CreateProjectRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Results.BadRequest(new { message = "Project name is required" });
        }

        if (string.IsNullOrWhiteSpace(request.Description))
        {
            return Results.BadRequest(new { message = "Project description is required" });
        }

        return null;
    }

    private static IResult? ValidateUpdateRequest(UpdateProjectRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Results.BadRequest(new { message = "Project name is required" });
        }

        if (string.IsNullOrWhiteSpace(request.Description))
        {
            return Results.BadRequest(new { message = "Project description is required" });
        }

        return null;
    }
}
