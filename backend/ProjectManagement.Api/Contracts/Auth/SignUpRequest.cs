using System.ComponentModel.DataAnnotations;

namespace ProjectManagement.Api.Contracts.Auth;

public record SignUpRequest(
    [property: Required(ErrorMessage = "Username is required")]
    [property: RegularExpression(@"^.*\S.*$", ErrorMessage = "Username is required")]
    string Username,
    [property: Required(ErrorMessage = "Email is required")]
    [property: RegularExpression(@"^.*\S.*$", ErrorMessage = "Email is required")]
    [property: EmailAddress(ErrorMessage = "Email format is invalid")]
    string Email,
    [property: Required(ErrorMessage = "Password is required")]
    [property: RegularExpression(@"^.*\S.*$", ErrorMessage = "Password is required")]
    [property: MinLength(8, ErrorMessage = "Password must contain at least 8 characters")]
    string Password);
