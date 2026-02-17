using ProjectManagement.Api.Contracts.Projects;
using ProjectManagement.Api.Services;

namespace ProjectManagement.Api.Endpoints;

public static class ProjectEndpoints
{
    public static IEndpointRouteBuilder MapProjectEndpoints(this IEndpointRouteBuilder app)
    {
        var projects = app.MapGroup("/api/projects");

        projects.MapGet("/", async (IProjectService service) =>
        {
            var allProjects = await service.GetAllAsync();
            return Results.Ok(allProjects);
        });

        projects.MapGet("/{id:int}", async (int id, IProjectService service) =>
        {
            var project = await service.GetByIdAsync(id);
            if (project is null)
            {
                return Results.NotFound(new { message = "Project not found" });
            }

            return Results.Ok(project);
        });

        projects.MapPost("/", async (CreateProjectRequest request, IProjectService service) =>
        {
            var result = await service.CreateAsync(request);
            if (!result.Success)
            {
                return Results.BadRequest(new { message = result.Error });
            }

            return Results.Created($"/api/projects/{result.Value!.Id}", result.Value);
        });

        projects.MapPut("/{id:int}", async (int id, UpdateProjectRequest request, IProjectService service) =>
        {
            var result = await service.UpdateAsync(id, request);
            if (!result.Success)
            {
                return result.StatusCode == 404
                    ? Results.NotFound(new { message = result.Error })
                    : Results.BadRequest(new { message = result.Error });
            }

            return Results.Ok(result.Value);
        });

        projects.MapDelete("/{id:int}", async (int id, IProjectService service) =>
        {
            var result = await service.DeleteAsync(id);
            if (!result.Success)
            {
                return Results.NotFound(new { message = result.Error });
            }

            return Results.NoContent();
        });

        return app;
    }
}
