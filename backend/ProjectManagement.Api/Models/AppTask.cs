namespace ProjectManagement.Api.Models;

public class AppTask
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime DueDateUtc { get; set; }

    public int ProjectId { get; set; }
    public AppProject Project { get; set; } = null!;

    public int AssignedToUserId { get; set; }
    public AppUser AssignedToUser { get; set; } = null!;
}
