namespace ProjectManagement.Api.Models;

/// <summary>
/// Tracks the lifecycle of a project invitation before it becomes a real participation.
/// </summary>
public enum ProjectInvitationStatus
{
    Pending = 1,
    Accepted = 2,
    Declined = 3,
    Canceled = 4
}
