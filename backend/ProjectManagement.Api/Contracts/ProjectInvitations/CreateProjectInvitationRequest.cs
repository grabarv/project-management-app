using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Contracts.ProjectInvitations;

public record CreateProjectInvitationRequest(
    [property: Required(ErrorMessage = "InvitedUsername is required")]
    [property: RegularExpression(@"^.*\S.*$", ErrorMessage = "InvitedUsername is required")]
    string InvitedUsername);
