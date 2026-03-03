namespace ProjectManagement.Api.Contracts.Projects;

/// <summary>
/// Lightweight invitation data embedded in project read responses.
/// </summary>
public record ProjectInvitationSummaryResponse(
    int Id,
    int InvitedUserId,
    string InvitedUsername,
    int InvitedByUserId,
    string InvitedByUsername,
    string Status,
    DateTime CreatedAtUtc,
    DateTime? RespondedAtUtc);
