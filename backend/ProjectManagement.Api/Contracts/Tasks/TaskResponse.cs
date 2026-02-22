namespace ProjectManagement.Api.Contracts.Tasks;

public record TaskResponse(
    int Id,
    string Name,
    string Description,
    DateTime CreatedAtUtc,
    DateTime DueDateUtc,
    int ProjectId,
    int AssignedToUserId);
