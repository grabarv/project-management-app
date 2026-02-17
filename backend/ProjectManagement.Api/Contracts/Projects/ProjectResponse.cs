namespace ProjectManagement.Api.Contracts.Projects;

public record ProjectResponse(
    int Id,
    string Name,
    string Description,
    DateTime CreatedAtUtc,
    DateTime DueDateUtc,
    int CreatedByUserId,
    List<int> ParticipatingUserIds);
