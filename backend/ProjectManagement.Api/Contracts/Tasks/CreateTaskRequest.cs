namespace ProjectManagement.Api.Contracts.Tasks;

public record CreateTaskRequest(
    string Name,
    string Description,
    string Status,
    DateTime DueDateUtc,
    int AssignedToUserId);
