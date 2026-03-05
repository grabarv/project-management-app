using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Contracts.Tasks;

public record CreateTaskRequest(
    [property: Required(ErrorMessage = "Task name is required")]
    [property: RegularExpression(@"^.*\S.*$", ErrorMessage = "Task name is required")]
    string Name,
    [property: Required(ErrorMessage = "Task description is required")]
    [property: RegularExpression(@"^.*\S.*$", ErrorMessage = "Task description is required")]
    string Description,
    [property: Required(ErrorMessage = "Task status is required")]
    [property: RegularExpression(@"^.*\S.*$", ErrorMessage = "Task status is required")]
    string Status,
    DateTime DueDateUtc,
    [property: Range(1, int.MaxValue, ErrorMessage = "AssignedToUserId is required")]
    int AssignedToUserId);
