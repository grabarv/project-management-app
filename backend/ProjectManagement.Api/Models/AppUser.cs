namespace ProjectManagement.Api.Models;

public class AppUser
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }

    public ICollection<AppProject> CreatedProjects { get; set; } = new List<AppProject>();
    public ICollection<AppProject> ParticipatingProjects { get; set; } = new List<AppProject>();
}
