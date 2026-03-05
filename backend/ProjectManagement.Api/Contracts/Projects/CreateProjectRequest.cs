using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Contracts.Projects;

public record CreateProjectRequest(
    [property: Required(ErrorMessage = "Project name is required")]
    [property: RegularExpression(@"^.*\S.*$", ErrorMessage = "Project name is required")]
    string Name,
    [property: Required(ErrorMessage = "Project description is required")]
    [property: RegularExpression(@"^.*\S.*$", ErrorMessage = "Project description is required")]
    string Description,
    DateTime DueDateUtc,
    int CreatedByUserId,
    List<int> ParticipatingUserIds);
