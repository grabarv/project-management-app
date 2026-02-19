using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Endpoints;

namespace ProjectManagement.Api.Extensions;

public static class WebApplicationExtensions
{
    /// <summary>
    /// Applies pending EF Core migrations on startup.
    /// </summary>
    public static WebApplication InitializeDatabase(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
        return app;
    }

    /// <summary>
    /// Configures cross-cutting middleware in execution order.
    /// </summary>
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

    /// <summary>
    /// Maps endpoint groups used by the API.
    /// </summary>
    public static WebApplication MapApplicationEndpoints(this WebApplication app)
    {
        app.MapAuthEndpoints();
        app.MapProjectEndpoints();
        return app;
    }
}
