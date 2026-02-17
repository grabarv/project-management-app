namespace ProjectManagement.Api.Contracts.Projects;

public record CreateProjectRequest(
    string Name,
    string Description,
    DateTime DueDateUtc,
    int CreatedByUserId,
    List<int> ParticipatingUserIds);
