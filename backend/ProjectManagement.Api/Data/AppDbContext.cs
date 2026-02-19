using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Models;

namespace ProjectManagement.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<AppProject> Projects => Set<AppProject>();

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

        modelBuilder.Entity<AppProject>()
            .HasOne(project => project.CreatedByUser)
            .WithMany(user => user.CreatedProjects)
            .HasForeignKey(project => project.CreatedByUserId)
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
}
