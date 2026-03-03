namespace ProjectManagement.Api.Models;

public class AppProject
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime DueDateUtc { get; set; }

    public int CreatedByUserId { get; set; }
    public AppUser CreatedByUser { get; set; } = null!;

    public ICollection<AppUser> ParticipatingUsers { get; set; } = new List<AppUser>();
    public ICollection<AppProjectInvitation> Invitations { get; set; } = new List<AppProjectInvitation>();
    public ICollection<AppTask> Tasks { get; set; } = new List<AppTask>();
}
