using ProjectManagement.Api.Contracts.Projects;

namespace ProjectManagement.Api.Services;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectResponse>> GetAllAsync();
    Task<ProjectResponse?> GetByIdAsync(int id);
    Task<OperationResult<ProjectResponse>> CreateAsync(CreateProjectRequest request);
    Task<OperationResult<ProjectResponse>> UpdateAsync(int id, UpdateProjectRequest request);
    Task<OperationResult<bool>> DeleteAsync(int id);
}
