namespace ProjectManagement.Api.Contracts.Tasks;

public record UpdateTaskRequest(
    string Name,
    string Description,
    string Status,
    DateTime DueDateUtc,
    int AssignedToUserId);
