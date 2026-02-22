namespace ProjectManagement.Api.Contracts.Tasks;

public record CreateTaskRequest(
    string Name,
    string Description,
    DateTime DueDateUtc,
    int AssignedToUserId);
