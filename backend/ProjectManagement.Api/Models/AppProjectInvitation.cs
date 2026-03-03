namespace ProjectManagement.Api.Models;

/// <summary>
/// Represents a pending or resolved request for a user to join a project.
/// </summary>
public class AppProjectInvitation
{
    public int Id { get; set; }
    public string Status { get; set; } = ProjectInvitationStatus.Pending.ToString();
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? RespondedAtUtc { get; set; }

    public int ProjectId { get; set; }
    public AppProject Project { get; set; } = null!;

    public int InvitedUserId { get; set; }
    public AppUser InvitedUser { get; set; } = null!;

    public int InvitedByUserId { get; set; }
    public AppUser InvitedByUser { get; set; } = null!;
}
