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

            var result = await service.CreateAsync(projectId, request, currentUserId);
            if (!result.Success)
            {
                return result.ToHttpError();
            }

            return Results.Created($"/api/tasks/{result.Value!.Id}", result.Value);
        })
        .AddEndpointFilter<RequestValidationFilter<CreateTaskRequest>>();

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

            var result = await service.UpdateAsync(id, request, currentUserId);
            return result.Success ? Results.Ok(result.Value) : result.ToHttpError();
        })
        .AddEndpointFilter<RequestValidationFilter<UpdateTaskRequest>>();

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
}
