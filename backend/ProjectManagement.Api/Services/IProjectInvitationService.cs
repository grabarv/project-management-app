using ProjectManagement.Api.Contracts.ProjectInvitations;

namespace ProjectManagement.Api.Services;

public interface IProjectInvitationService
{
    /// <summary>
    /// Returns invitations received by the current user.
    /// </summary>
    Task<IReadOnlyList<ProjectInvitationResponse>> GetReceivedAsync(int currentUserId);

    /// <summary>
    /// Returns invitations for a project. Only the creator can access this list.
    /// </summary>
    Task<OperationResult<IReadOnlyList<ProjectInvitationResponse>>> GetForProjectAsync(int projectId, int currentUserId);

    /// <summary>
    /// Sends a new invitation to join a project.
    /// </summary>
    Task<OperationResult<ProjectInvitationResponse>> CreateAsync(
        int projectId,
        CreateProjectInvitationRequest request,
        int currentUserId);

    /// <summary>
    /// Accepts an invitation and adds the user to project participants.
    /// </summary>
    Task<OperationResult<ProjectInvitationResponse>> AcceptAsync(int invitationId, int currentUserId);

    /// <summary>
    /// Declines an invitation.
    /// </summary>
    Task<OperationResult<ProjectInvitationResponse>> DeclineAsync(int invitationId, int currentUserId);

    /// <summary>
    /// Cancels an invitation. Only the project creator can cancel it.
    /// </summary>
    Task<OperationResult<ProjectInvitationResponse>> CancelAsync(int invitationId, int currentUserId);
}
