namespace ProjectManagement.Api.Contracts.Tasks;

public record UpdateTaskRequest(
    string Name,
    string Description,
    DateTime DueDateUtc,
    int AssignedToUserId);
