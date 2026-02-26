namespace ProjectManagement.Api.Contracts.Tasks;

public record TaskResponse(
    int Id,
    string Name,
    string Description,
    string Status,
    DateTime CreatedAtUtc,
    DateTime DueDateUtc,
    int ProjectId,
    int AssignedToUserId,
    string AssignedToUsername);
