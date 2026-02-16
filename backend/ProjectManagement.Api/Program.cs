using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddScoped<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("FrontendDev");
app.UseHttpsRedirection();


app.MapPost("/api/auth/signup", async (
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

app.Run();

record SignUpRequest(string Username, string Email, string Password);
