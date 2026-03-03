namespace ProjectManagement.Api.Contracts.ProjectInvitations;

public record ProjectInvitationResponse(
    int Id,
    int ProjectId,
    string ProjectName,
    int InvitedUserId,
    string InvitedUsername,
    int InvitedByUserId,
    string InvitedByUsername,
    string Status,
    DateTime CreatedAtUtc,
    DateTime? RespondedAtUtc);
