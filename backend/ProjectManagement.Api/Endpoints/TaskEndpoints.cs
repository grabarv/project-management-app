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
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            var result = await service.GetByProjectAsync(projectId, currentUserResult.Value);
            return result.Success ? Results.Ok(result.Value) : ToHttpError(result);
        });

        tasks.MapGet("/tasks/{id:int}", async (
            int id,
            HttpContext httpContext,
            ITaskService service) =>
        {
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            var result = await service.GetByIdAsync(id, currentUserResult.Value);
            return result.Success ? Results.Ok(result.Value) : ToHttpError(result);
        });

        tasks.MapPost("/projects/{projectId:int}/tasks", async (
            int projectId,
            CreateTaskRequest request,
            HttpContext httpContext,
            ITaskService service) =>
        {
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            var validationError = ValidateCreateRequest(request);
            if (validationError is not null)
            {
                return validationError;
            }

            var result = await service.CreateAsync(projectId, request, currentUserResult.Value);
            if (!result.Success)
            {
                return ToHttpError(result);
            }

            return Results.Created($"/api/tasks/{result.Value!.Id}", result.Value);
        });

        tasks.MapPut("/tasks/{id:int}", async (
            int id,
            UpdateTaskRequest request,
            HttpContext httpContext,
            ITaskService service) =>
        {
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            var validationError = ValidateUpdateRequest(request);
            if (validationError is not null)
            {
                return validationError;
            }

            var result = await service.UpdateAsync(id, request, currentUserResult.Value);
            return result.Success ? Results.Ok(result.Value) : ToHttpError(result);
        });

        tasks.MapPost("/tasks/{id:int}/toggle-done", async (
            int id,
            HttpContext httpContext,
            ITaskService service) =>
        {
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            var result = await service.ToggleDoneAsync(id, currentUserResult.Value);
            return result.Success ? Results.Ok(result.Value) : ToHttpError(result);
        });

        tasks.MapDelete("/tasks/{id:int}", async (
            int id,
            HttpContext httpContext,
            ITaskService service) =>
        {
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            var result = await service.DeleteAsync(id, currentUserResult.Value);
            return result.Success ? Results.NoContent() : ToHttpError(result);
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
