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
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            var allProjects = await service.GetAllAsync(currentUserResult.Value);
            return Results.Ok(allProjects);
        });

        projects.MapGet("/{id:int}", async (int id, HttpContext httpContext, IProjectService service) =>
        {
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            var result = await service.GetByIdAsync(id, currentUserResult.Value);
            if (!result.Success)
            {
                return ToHttpError(result);
            }

            return Results.Ok(result.Value);
        });

        projects.MapPost("/", async (CreateProjectRequest request, HttpContext httpContext, IProjectService service) =>
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

            var result = await service.CreateAsync(request, currentUserResult.Value);
            if (!result.Success)
            {
                return ToHttpError(result);
            }

            return Results.Created($"/api/projects/{result.Value!.Id}", result.Value);
        });

        projects.MapPut("/{id:int}", async (int id, UpdateProjectRequest request, HttpContext httpContext, IProjectService service) =>
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
            if (!result.Success)
            {
                return ToHttpError(result);
            }

            return Results.Ok(result.Value);
        });

        projects.MapDelete("/{id:int}", async (int id, HttpContext httpContext, IProjectService service) =>
        {
            var currentUserResult = TryGetCurrentUserId(httpContext);
            if (!currentUserResult.Success)
            {
                return currentUserResult.ErrorResult!;
            }

            var result = await service.DeleteAsync(id, currentUserResult.Value);
            if (!result.Success)
            {
                return ToHttpError(result);
            }

            return Results.NoContent();
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
