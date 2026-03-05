using ProjectManagement.Api.Contracts.Tasks;
using ProjectManagement.Api.Services;

namespace ProjectManagement.Api.Endpoints;

public static class TaskEndpoints
{
    /// <summary>
    /// Maps CRUD endpoints for project tasks.
    /// </summary>
    public static IEndpointRouteBuilder MapTaskEndpoints(this IEndpointRouteBuilder app)
    {
        var tasks = app.MapGroup("/api");

        tasks.MapGet("/projects/{projectId:int}/tasks", async (
            int projectId,
            HttpContext httpContext,
            ITaskService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var result = await service.GetByProjectAsync(projectId, currentUserId);
            return result.Success ? Results.Ok(result.Value) : result.ToHttpError();
        });

        tasks.MapGet("/tasks/{id:int}", async (
            int id,
            HttpContext httpContext,
            ITaskService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var result = await service.GetByIdAsync(id, currentUserId);
            return result.Success ? Results.Ok(result.Value) : result.ToHttpError();
        });

        tasks.MapPost("/projects/{projectId:int}/tasks", async (
            int projectId,
            CreateTaskRequest request,
            HttpContext httpContext,
            ITaskService service) =>
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

            var result = await service.CreateAsync(projectId, request, currentUserId);
            if (!result.Success)
            {
                return result.ToHttpError();
            }

            return Results.Created($"/api/tasks/{result.Value!.Id}", result.Value);
        });

        tasks.MapPut("/tasks/{id:int}", async (
            int id,
            UpdateTaskRequest request,
            HttpContext httpContext,
            ITaskService service) =>
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
            return result.Success ? Results.Ok(result.Value) : result.ToHttpError();
        });

        tasks.MapPost("/tasks/{id:int}/toggle-done", async (
            int id,
            HttpContext httpContext,
            ITaskService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var result = await service.ToggleDoneAsync(id, currentUserId);
            return result.Success ? Results.Ok(result.Value) : result.ToHttpError();
        });

        tasks.MapDelete("/tasks/{id:int}", async (
            int id,
            HttpContext httpContext,
            ITaskService service) =>
        {
            if (!httpContext.TryResolveCurrentUserId(out var currentUserId, out var errorResult))
            {
                return errorResult!;
            }

            var result = await service.DeleteAsync(id, currentUserId);
            return result.Success ? Results.NoContent() : result.ToHttpError();
        });

        return app;
    }

    private static IResult? ValidateCreateRequest(CreateTaskRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Results.BadRequest(new { message = "Task name is required" });
        }

        if (string.IsNullOrWhiteSpace(request.Description))
        {
            return Results.BadRequest(new { message = "Task description is required" });
        }

        if (string.IsNullOrWhiteSpace(request.Status))
        {
            return Results.BadRequest(new { message = "Task status is required" });
        }
        // Allowed values are enforced in the service through TaskStatus enum parsing.

        if (request.AssignedToUserId <= 0)
        {
            return Results.BadRequest(new { message = "AssignedToUserId is required" });
        }

        return null;
    }

    private static IResult? ValidateUpdateRequest(UpdateTaskRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Results.BadRequest(new { message = "Task name is required" });
        }

        if (string.IsNullOrWhiteSpace(request.Description))
        {
            return Results.BadRequest(new { message = "Task description is required" });
        }

        if (string.IsNullOrWhiteSpace(request.Status))
        {
            return Results.BadRequest(new { message = "Task status is required" });
        }
        // Allowed values are enforced in the service through TaskStatus enum parsing.

        if (request.AssignedToUserId <= 0)
        {
            return Results.BadRequest(new { message = "AssignedToUserId is required" });
        }

        return null;
    }
}
