using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Contracts.Auth;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Models;

namespace ProjectManagement.Api.Endpoints;

public static class AuthEndpoints
{
    /// <summary>
    /// Maps sign-up and sign-in endpoints.
    /// </summary>
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var auth = app.MapGroup("/api/auth");

        auth.MapPost("/signup", async (
            SignUpRequest request,
            AppDbContext db,
            IPasswordHasher<AppUser> passwordHasher) =>
        {
            var validationError = ValidateSignUpRequest(request);
            if (validationError is not null)
            {
                return validationError;
            }

            var existingUser = await db.Users
                .AnyAsync(user => user.Email == request.Email);

            if (existingUser)
            {
                return Results.Conflict(new { message = "Email is already registered" });
            }

            var user = new AppUser
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = string.Empty,
                CreatedAtUtc = DateTime.UtcNow
            };

            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return Results.Ok(new
            {
                message = "Sign-up data saved",
                userId = user.Id,
                username = user.Username,
                email = user.Email
            });
        })
        .WithName("SignUp");

        auth.MapPost("/signin", async (
            SignInRequest request,
            AppDbContext db,
            IPasswordHasher<AppUser> passwordHasher) =>
        {
            var validationError = ValidateSignInRequest(request);
            if (validationError is not null)
            {
                return validationError;
            }

            var user = await db.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user is null)
            {
                return Results.Unauthorized();
            }

            var verificationResult = passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password);

            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return Results.Unauthorized();
            }

            return Results.Ok(new
            {
                message = "Sign-in successful",
                userId = user.Id,
                username = user.Username,
                email = user.Email
            });
        })
        .WithName("SignIn");

        return app;
    }

    private static IResult? ValidateSignUpRequest(SignUpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username))
        {
            return Results.BadRequest(new { message = "Username is required" });
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return Results.BadRequest(new { message = "Email is required" });
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
        {
            return Results.BadRequest(new { message = "Password must contain at least 8 characters" });
        }

        return null;
    }

    private static IResult? ValidateSignInRequest(SignInRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return Results.BadRequest(new { message = "Email is required" });
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest(new { message = "Password is required" });
        }

        return null;
    }
}
