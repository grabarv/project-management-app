using ProjectManagement.Api.Contracts.Tasks;

namespace ProjectManagement.Api.Services;

public interface ITaskService
{
    /// <summary>
    /// Returns tasks for a project when the current user has access to that project.
    /// </summary>
    Task<OperationResult<IReadOnlyList<TaskResponse>>> GetByProjectAsync(int projectId, int currentUserId);

    /// <summary>
    /// Returns a single task when the current user can access its project.
    /// </summary>
    Task<OperationResult<TaskResponse>> GetByIdAsync(int id, int currentUserId);

    /// <summary>
    /// Creates a task inside a project. Only the project creator can create tasks.
    /// </summary>
    Task<OperationResult<TaskResponse>> CreateAsync(int projectId, CreateTaskRequest request, int currentUserId);

    /// <summary>
    /// Updates a task. Only the project creator can update tasks.
    /// </summary>
    Task<OperationResult<TaskResponse>> UpdateAsync(int id, UpdateTaskRequest request, int currentUserId);

    /// <summary>
    /// Toggles a task between Done and Pending for the assigned user.
    /// </summary>
    Task<OperationResult<TaskResponse>> ToggleDoneAsync(int id, int currentUserId);

    /// <summary>
    /// Deletes a task. Only the project creator can delete tasks.
    /// </summary>
    Task<OperationResult<bool>> DeleteAsync(int id, int currentUserId);
}
