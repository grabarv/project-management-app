namespace ProjectManagement.Api.Contracts.Projects;

public record UpdateProjectRequest(
    string Name,
    string Description,
    DateTime DueDateUtc,
    List<int> ParticipatingUserIds);
