namespace ProjectManagement.Api.Models;

public class AppUser
{
    public int Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    public ICollection<AppProject> CreatedProjects { get; set; } = new List<AppProject>();
    public ICollection<AppProject> ParticipatingProjects { get; set; } = new List<AppProject>();
}
