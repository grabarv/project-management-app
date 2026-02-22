using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Endpoints;
using ProjectManagement.Api.Models;
using AppTaskStatus = ProjectManagement.Api.Models.TaskStatus;

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
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<AppUser>>();

        db.Database.Migrate();
        SeedSampleData(db, passwordHasher);
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
        app.MapTaskEndpoints();
        return app;
    }

    /// <summary>
    /// Seeds a small demo dataset once for a newly created/empty database.
    /// </summary>
    private static void SeedSampleData(AppDbContext db, IPasswordHasher<AppUser> passwordHasher)
    {
        // Seed base demo users/projects only for an empty database.
        if (!db.Users.Any())
        {
            SeedUsersAndProjects(db, passwordHasher);
        }

        // Tasks are seeded separately so they can be added after a later migration too.
        SeedTasks(db);
    }

    private static void SeedUsersAndProjects(AppDbContext db, IPasswordHasher<AppUser> passwordHasher)
    {
        var now = DateTime.UtcNow;

        var alice = new AppUser
        {
            Username = "alice",
            Email = "alice@example.com",
            PasswordHash = string.Empty,
            CreatedAtUtc = now
        };
        alice.PasswordHash = passwordHasher.HashPassword(alice, "P@ssw0rd123");

        var bob = new AppUser
        {
            Username = "bob",
            Email = "bob@example.com",
            PasswordHash = string.Empty,
            CreatedAtUtc = now
        };
        bob.PasswordHash = passwordHasher.HashPassword(bob, "P@ssw0rd123");

        var carol = new AppUser
        {
            Username = "carol",
            Email = "carol@example.com",
            PasswordHash = string.Empty,
            CreatedAtUtc = now
        };
        carol.PasswordHash = passwordHasher.HashPassword(carol, "P@ssw0rd123");

        db.Users.AddRange(alice, bob, carol);
        db.SaveChanges();

        var websiteRedesign = new AppProject
        {
            Name = "Website Redesign",
            Description = "Refresh landing page, auth flow, and workspace UI.",
            CreatedAtUtc = now,
            DueDateUtc = now.AddDays(14),
            CreatedByUserId = alice.Id,
            ParticipatingUsers = new List<AppUser> { bob, carol }
        };

        var apiCleanup = new AppProject
        {
            Name = "API Cleanup",
            Description = "Refactor endpoints and standardize API responses.",
            CreatedAtUtc = now,
            DueDateUtc = now.AddDays(10),
            CreatedByUserId = bob.Id,
            ParticipatingUsers = new List<AppUser> { alice }
        };

        db.Projects.AddRange(websiteRedesign, apiCleanup);
        db.SaveChanges();
    }

    private static void SeedTasks(AppDbContext db)
    {
        if (db.Tasks.Any())
        {
            return;
        }

        var users = db.Users.AsNoTracking().ToDictionary(user => user.Username);
        var projects = db.Projects.AsNoTracking().ToDictionary(project => project.Name);

        if (!users.TryGetValue("alice", out var alice) ||
            !users.TryGetValue("bob", out var bob) ||
            !users.TryGetValue("carol", out var carol) ||
            !projects.TryGetValue("Website Redesign", out var websiteRedesign) ||
            !projects.TryGetValue("API Cleanup", out var apiCleanup))
        {
            // Skip if demo data is missing or was replaced manually.
            return;
        }

        var now = DateTime.UtcNow;

        // Tasks are seeded after projects so foreign keys and assignment checks are valid.
        db.Tasks.AddRange(
            new AppTask
            {
                Name = "Create wireframes",
                Description = "Prepare initial layout wireframes for desktop and mobile.",
                Status = AppTaskStatus.InProgress.ToString(),
                CreatedAtUtc = now,
                DueDateUtc = now.AddDays(5),
                ProjectId = websiteRedesign.Id,
                AssignedToUserId = bob.Id
            },
            new AppTask
            {
                Name = "Review color palette",
                Description = "Validate brand colors and accessibility contrast.",
                Status = AppTaskStatus.Pending.ToString(),
                CreatedAtUtc = now,
                DueDateUtc = now.AddDays(7),
                ProjectId = websiteRedesign.Id,
                AssignedToUserId = carol.Id
            },
            new AppTask
            {
                Name = "Unify error responses",
                Description = "Return consistent JSON payloads for 4xx/5xx responses.",
                Status = AppTaskStatus.Pending.ToString(),
                CreatedAtUtc = now,
                DueDateUtc = now.AddDays(4),
                ProjectId = apiCleanup.Id,
                AssignedToUserId = alice.Id
            });

        db.SaveChanges();
    }
}
