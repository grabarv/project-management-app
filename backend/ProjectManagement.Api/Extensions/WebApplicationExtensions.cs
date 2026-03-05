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
        app.MapProjectInvitationEndpoints();
        app.MapTaskEndpoints();
        return app;
    }

    /// <summary>
    /// Seeds a larger, interconnected demo dataset once for a newly created/empty database.
    /// </summary>
    private static void SeedSampleData(AppDbContext db, IPasswordHasher<AppUser> passwordHasher)
    {
        NormalizeLegacyTaskStatuses(db);
        if (db.Users.Any())
        {
            return;
        }

        SeedUsersProjectsInvitationsAndTasks(db, passwordHasher);
    }

    private static void NormalizeLegacyTaskStatuses(AppDbContext db)
    {
        var pendingTasks = db.Tasks
            .Where(task => task.Status == "Pending")
            .ToList();

        if (pendingTasks.Count == 0)
        {
            return;
        }

        foreach (var task in pendingTasks)
        {
            task.Status = AppTaskStatus.InProgress.ToString();
        }

        db.SaveChanges();
    }

    private static void SeedUsersProjectsInvitationsAndTasks(
        AppDbContext db,
        IPasswordHasher<AppUser> passwordHasher)
    {
        var now = DateTime.UtcNow;

        var users = BuildUsers(passwordHasher, now);
        db.Users.AddRange(users);
        db.SaveChanges();

        var usersByUsername = users.ToDictionary(user => user.Username);

        var projectPlans = BuildProjectPlans();
        var projects = projectPlans
            .Select(plan => new AppProject
            {
                Name = plan.Name,
                Description = plan.Description,
                CreatedAtUtc = now.AddDays(-plan.CreatedDaysAgo),
                DueDateUtc = now.AddDays(plan.DueInDays),
                CreatedByUserId = usersByUsername[plan.OwnerUsername].Id,
                ParticipatingUsers = plan.ParticipantUsernames
                    .Select(username => usersByUsername[username])
                    .ToList()
            })
            .ToList();

        db.Projects.AddRange(projects);
        db.SaveChanges();

        var projectsByName = projects.ToDictionary(project => project.Name);
        db.Tasks.AddRange(BuildTasks(projects, now));
        db.ProjectInvitations.AddRange(BuildInvitations(projectsByName, usersByUsername, now));
        db.SaveChanges();
    }

    private static List<AppUser> BuildUsers(
        IPasswordHasher<AppUser> passwordHasher,
        DateTime now)
    {
        var userSpecs = new[]
        {
            ("alice", "alice@example.com"),
            ("bob", "bob@example.com"),
            ("carol", "carol@example.com"),
            ("dave", "dave@example.com"),
            ("emma", "emma@example.com"),
            ("frank", "frank@example.com"),
            ("grace", "grace@example.com")
        };

        var users = userSpecs
            .Select((spec, index) => new AppUser
            {
                Username = spec.Item1,
                Email = spec.Item2,
                PasswordHash = string.Empty,
                CreatedAtUtc = now.AddDays(-(220 - (index * 4)))
            })
            .ToList();

        foreach (var user in users)
        {
            user.PasswordHash = passwordHasher.HashPassword(user, "password123");
        }

        return users;
    }

    private static IReadOnlyList<ProjectSeedPlan> BuildProjectPlans()
    {
        return
        [
            new(
                "Orion Core API",
                "Shared domain API for workspace, projects, invitations, and tasks.",
                "alice",
                70,
                45,
                ["bob", "carol", "dave"]),
            new(
                "Orion Tenant Onboarding",
                "Tenant bootstrap automation, first-run wizard, and defaults provisioning.",
                "alice",
                62,
                35,
                ["carol", "emma", "frank"]),
            new(
                "Orion UI Workspace",
                "Workspace shell, split layout, and project navigation experience.",
                "bob",
                68,
                50,
                ["carol", "dave", "emma"]),
            new(
                "Orion Design System",
                "Shared components, tokens, and accessibility patterns for product UI.",
                "bob",
                59,
                34,
                ["dave", "frank", "grace"]),
            new(
                "Orion Data Pipeline",
                "ETL jobs for project metrics and daily aggregation snapshots.",
                "carol",
                64,
                41,
                ["dave", "emma", "frank"]),
            new(
                "Orion Analytics Dashboard",
                "Operational dashboard with workload and throughput trend widgets.",
                "carol",
                53,
                31,
                ["emma", "grace", "alice"]),
            new(
                "Orion Mobile Companion",
                "Mobile app for project updates, task inbox, and daily standups.",
                "dave",
                58,
                42,
                ["emma", "frank", "grace"]),
            new(
                "Orion Notification Service",
                "Real-time notification fanout for mentions, tasks, and invitation events.",
                "dave",
                49,
                28,
                ["frank", "alice", "bob"]),
            new(
                "Orion QA Automation",
                "Regression test matrix for API contracts and critical UI workflows.",
                "emma",
                57,
                39,
                ["frank", "grace", "alice"]),
            new(
                "Orion Release Train",
                "Release governance, branch policy checks, and production rollout plan.",
                "emma",
                46,
                27,
                ["grace", "bob", "carol"]),
            new(
                "Orion Infrastructure Hardening",
                "Security baselines, dependency hygiene, and policy-as-code checks.",
                "frank",
                56,
                38,
                ["grace", "alice", "bob"]),
            new(
                "Orion Incident Command Center",
                "Incident response runbooks, paging flow, and postmortem automation.",
                "frank",
                43,
                24,
                ["alice", "carol", "dave"]),
            new(
                "Orion Customer Portal",
                "External portal for project visibility and asynchronous collaboration.",
                "grace",
                54,
                36,
                ["alice", "bob", "carol"]),
            new(
                "Orion Knowledge Base",
                "Living documentation and cross-team decision archive.",
                "grace",
                41,
                22,
                ["bob", "dave", "emma"])
        ];
    }

    private static List<AppTask> BuildTasks(
        IReadOnlyCollection<AppProject> projects,
        DateTime now)
    {
        var templates = new (string Title, string Description)[]
        {
            ("Scope lock", "Finalize scope boundaries and confirm cross-team dependencies."),
            ("Implementation slice", "Deliver the next implementation slice and update notes."),
            ("QA pass", "Validate happy-path and edge-case behavior before handoff."),
            ("Observability updates", "Add logs/metrics/traces for the newest project changes."),
            ("Documentation sync", "Sync technical docs and update onboarding references."),
            ("Stakeholder demo", "Prepare a short walkthrough for the next review meeting.")
        };

        var tasks = new List<AppTask>();

        foreach (var project in projects.OrderBy(project => project.CreatedAtUtc))
        {
            var assignableUserIds = new List<int> { project.CreatedByUserId };
            assignableUserIds.AddRange(project.ParticipatingUsers.Select(user => user.Id));

            for (var taskIndex = 0; taskIndex < templates.Length; taskIndex++)
            {
                var template = templates[taskIndex];
                var createdAtUtc = project.CreatedAtUtc.AddDays(taskIndex * 2);
                var dueDateUtc = createdAtUtc.AddDays(8 + (taskIndex * 2));

                if (dueDateUtc > project.DueDateUtc)
                {
                    dueDateUtc = project.DueDateUtc.AddDays(-1);
                }

                if (dueDateUtc <= createdAtUtc)
                {
                    dueDateUtc = createdAtUtc.AddDays(1);
                }

                tasks.Add(new AppTask
                {
                    Name = $"{template.Title} - {project.Name}",
                    Description = $"{template.Description} Context: {project.Name}.",
                    Status = (taskIndex % 3 == 0 ? AppTaskStatus.Done : AppTaskStatus.InProgress).ToString(),
                    CreatedAtUtc = createdAtUtc > now ? now.AddHours(-1) : createdAtUtc,
                    DueDateUtc = dueDateUtc,
                    ProjectId = project.Id,
                    AssignedToUserId = assignableUserIds[taskIndex % assignableUserIds.Count]
                });
            }
        }

        return tasks;
    }

    private static List<AppProjectInvitation> BuildInvitations(
        IReadOnlyDictionary<string, AppProject> projectsByName,
        IReadOnlyDictionary<string, AppUser> usersByUsername,
        DateTime now)
    {
        var plans = new[]
        {
            new InvitationSeedPlan("Orion Core API", "alice", "emma", ProjectInvitationStatus.Pending, 7),
            new InvitationSeedPlan("Orion Tenant Onboarding", "alice", "grace", ProjectInvitationStatus.Pending, 6),
            new InvitationSeedPlan("Orion UI Workspace", "bob", "frank", ProjectInvitationStatus.Pending, 6),
            new InvitationSeedPlan("Orion Design System", "bob", "alice", ProjectInvitationStatus.Pending, 5),
            new InvitationSeedPlan("Orion Data Pipeline", "carol", "bob", ProjectInvitationStatus.Pending, 5),
            new InvitationSeedPlan("Orion Analytics Dashboard", "carol", "frank", ProjectInvitationStatus.Pending, 4),
            new InvitationSeedPlan("Orion Mobile Companion", "dave", "carol", ProjectInvitationStatus.Pending, 4),
            new InvitationSeedPlan("Orion Notification Service", "dave", "grace", ProjectInvitationStatus.Pending, 3),
            new InvitationSeedPlan("Orion QA Automation", "emma", "dave", ProjectInvitationStatus.Declined, 8),
            new InvitationSeedPlan("Orion Release Train", "emma", "alice", ProjectInvitationStatus.Canceled, 8),
            new InvitationSeedPlan("Orion Infrastructure Hardening", "frank", "emma", ProjectInvitationStatus.Declined, 9)
        };

        return plans
            .Select(plan =>
            {
                var createdAtUtc = now.AddDays(-plan.CreatedDaysAgo);
                DateTime? respondedAtUtc = plan.Status == ProjectInvitationStatus.Pending
                    ? null
                    : createdAtUtc.AddDays(1);

                return new AppProjectInvitation
                {
                    ProjectId = projectsByName[plan.ProjectName].Id,
                    InvitedByUserId = usersByUsername[plan.InvitedByUsername].Id,
                    InvitedUserId = usersByUsername[plan.InvitedUsername].Id,
                    Status = plan.Status.ToString(),
                    CreatedAtUtc = createdAtUtc,
                    RespondedAtUtc = respondedAtUtc
                };
            })
            .ToList();
    }

    private sealed record ProjectSeedPlan(
        string Name,
        string Description,
        string OwnerUsername,
        int CreatedDaysAgo,
        int DueInDays,
        IReadOnlyList<string> ParticipantUsernames);

    private sealed record InvitationSeedPlan(
        string ProjectName,
        string InvitedByUsername,
        string InvitedUsername,
        ProjectInvitationStatus Status,
        int CreatedDaysAgo);
}
