namespace ProjectManagement.Api.Models;

public class AppProject
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime DueDateUtc { get; set; }

    public int CreatedByUserId { get; set; }
    public AppUser CreatedByUser { get; set; } = null!;

    public ICollection<AppUser> ParticipatingUsers { get; set; } = new List<AppUser>();
}
