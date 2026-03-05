using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Contracts.Auth;

public record SignInRequest(
    [property: Required(ErrorMessage = "Email is required")]
    [property: RegularExpression(@"^.*\S.*$", ErrorMessage = "Email is required")]
    [property: EmailAddress(ErrorMessage = "Email format is invalid")]
    string Email,
    [property: Required(ErrorMessage = "Password is required")]
    [property: RegularExpression(@"^.*\S.*$", ErrorMessage = "Password is required")]
    string Password);
