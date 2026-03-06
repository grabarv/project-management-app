using ProjectManagement.Api.Contracts.Projects;

namespace ProjectManagement.Api.Services;

public interface IProjectService
{
    /// <summary>
    /// Returns only projects visible to the current user (creator or participant).
    /// </summary>
    Task<IReadOnlyList<ProjectResponse>> GetAllAsync(int currentUserId);

    /// <summary>
    /// Returns project details if the current user can access the project.
    /// </summary>
    Task<OperationResult<ProjectResponse>> GetByIdAsync(int id, int currentUserId);

    /// <summary>
    /// Creates a project for the current authenticated user.
    /// </summary>
    Task<OperationResult<ProjectResponse>> CreateAsync(CreateProjectRequest request, int currentUserId);

    /// <summary>
    /// Updates project fields. Only the creator can perform this action.
    /// </summary>
    Task<OperationResult<ProjectResponse>> UpdateAsync(int id, UpdateProjectRequest request, int currentUserId);

    /// <summary>
    /// Deletes a project. Only the creator can perform this action.
    /// </summary>
    Task<OperationResult<bool>> DeleteAsync(int id, int currentUserId);

    /// <summary>
    /// Removes an accepted participant from the project and deletes their project tasks.
    /// Allowed for the creator (remove any participant) or for a participant leaving themselves.
    /// </summary>
    Task<OperationResult<ProjectResponse>> RemoveParticipantAsync(
        int projectId,
        int participantUserId,
        int currentUserId);
}
