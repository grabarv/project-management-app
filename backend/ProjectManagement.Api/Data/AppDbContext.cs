using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Models;

namespace ProjectManagement.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<AppProject> Projects => Set<AppProject>();
    public DbSet<AppTask> Tasks => Set<AppTask>();

    public override int SaveChanges()
    {
        ValidateTaskAssignments();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ValidateTaskAssignments();
        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Keep emails unique to prevent duplicate identities.
        modelBuilder.Entity<AppUser>()
            .HasIndex(user => user.Email)
            .IsUnique();

        modelBuilder.Entity<AppUser>()
            .Property(user => user.Username)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<AppUser>()
            .Property(user => user.Email)
            .IsRequired()
            .HasMaxLength(200);

        modelBuilder.Entity<AppUser>()
            .Property(user => user.PasswordHash)
            .IsRequired();

        modelBuilder.Entity<AppProject>()
            .Property(project => project.Name)
            .IsRequired()
            .HasMaxLength(200);

        modelBuilder.Entity<AppProject>()
            .Property(project => project.Description)
            .IsRequired()
            .HasMaxLength(1000);

        modelBuilder.Entity<AppTask>()
            .Property(task => task.Name)
            .IsRequired()
            .HasMaxLength(200);

        modelBuilder.Entity<AppTask>()
            .Property(task => task.Description)
            .IsRequired()
            .HasMaxLength(1000);

        modelBuilder.Entity<AppTask>()
            .Property(task => task.Status)
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<AppProject>()
            .HasOne(project => project.CreatedByUser)
            .WithMany(user => user.CreatedProjects)
            .HasForeignKey(project => project.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AppTask>()
            .HasOne(task => task.Project)
            .WithMany(project => project.Tasks)
            .HasForeignKey(task => task.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AppTask>()
            .HasOne(task => task.AssignedToUser)
            .WithMany(user => user.AssignedTasks)
            .HasForeignKey(task => task.AssignedToUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AppProject>()
            .HasMany(project => project.ParticipatingUsers)
            .WithMany(user => user.ParticipatingProjects)
            // Explicit join entity makes DB schema predictable for migrations.
            .UsingEntity<Dictionary<string, object>>(
                "ProjectParticipant",
                right => right
                    .HasOne<AppUser>()
                    .WithMany()
                    .HasForeignKey("UserId")
                    .OnDelete(DeleteBehavior.Cascade),
                left => left
                    .HasOne<AppProject>()
                    .WithMany()
                    .HasForeignKey("ProjectId")
                    .OnDelete(DeleteBehavior.Cascade),
                join =>
                {
                    join.HasKey("ProjectId", "UserId");
                });
    }

    private void ValidateTaskAssignments()
    {
        var pendingTasks = ChangeTracker
            .Entries<AppTask>()
            .Where(entry => entry.State is EntityState.Added or EntityState.Modified)
            .Select(entry => entry.Entity)
            .ToList();

        if (pendingTasks.Count == 0)
        {
            return;
        }

        var projectIds = pendingTasks
            .Select(task => task.ProjectId)
            .Distinct()
            .ToList();

        var projectAssignmentData = Projects
            .AsNoTracking()
            .Where(project => projectIds.Contains(project.Id))
            .Select(project => new
            {
                project.Id,
                project.CreatedByUserId,
                ParticipantIds = project.ParticipatingUsers.Select(user => user.Id).ToList()
            })
            .ToList();

        var assignmentLookup = projectAssignmentData.ToDictionary(
            project => project.Id,
            project =>
            {
                var allowedUserIds = new HashSet<int>(project.ParticipantIds)
                {
                    project.CreatedByUserId
                };
                return allowedUserIds;
            });

        foreach (var task in pendingTasks)
        {
            if (!assignmentLookup.TryGetValue(task.ProjectId, out var allowedUserIds) ||
                !allowedUserIds.Contains(task.AssignedToUserId))
            {
                throw new InvalidOperationException(
                    "AssignedToUserId must be the project creator or a project participant.");
            }
        }
    }
}
