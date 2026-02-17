using ProjectManagement.Api.Data;
using ProjectManagement.Api.Endpoints;

namespace ProjectManagement.Api.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication InitializeDatabase(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // Keep EnsureCreated for now (no migrations in this refactor).
        db.Database.EnsureCreated();
        return app;
    }

    public static WebApplication UseApplicationPipeline(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseCors("FrontendDev");
        app.UseHttpsRedirection();

        return app;
    }

    public static WebApplication MapApplicationEndpoints(this WebApplication app)
    {
        app.MapAuthEndpoints();
        app.MapProjectEndpoints();
        return app;
    }
}
