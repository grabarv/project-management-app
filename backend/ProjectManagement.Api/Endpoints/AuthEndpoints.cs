using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Contracts.Auth;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Models;

namespace ProjectManagement.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var auth = app.MapGroup("/api/auth");

        auth.MapPost("/signup", async (
            SignUpRequest request,
            AppDbContext db,
            IPasswordHasher<AppUser> passwordHasher) =>
        {
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
}
