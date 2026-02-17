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
    // Creates schema from model when DB is empty.
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
    // Enforce unique email at API level before hitting DB unique constraint exception.
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

app.MapPost("/api/auth/signin", async (
    SignInRequest request,
    AppDbContext db,
    IPasswordHasher<AppUser> passwordHasher) =>
{
    // Sign-in is email-based for now.
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

var projects = app.MapGroup("/api/projects");

projects.MapGet("/", async (AppDbContext db) =>
{
    var allProjects = await db.Projects
        .AsNoTracking()
        .Include(project => project.ParticipatingUsers)
        .Select(project => new ProjectResponse(
            project.Id,
            project.Name,
            project.Description,
            project.CreatedAtUtc,
            project.DueDateUtc,
            project.CreatedByUserId,
            project.ParticipatingUsers.Select(user => user.Id).ToList()))
        .ToListAsync();

    return Results.Ok(allProjects);
});

projects.MapGet("/{id:int}", async (int id, AppDbContext db) =>
{
    var project = await db.Projects
        .AsNoTracking()
        .Include(p => p.ParticipatingUsers)
        .FirstOrDefaultAsync(p => p.Id == id);

    if (project is null)
    {
        return Results.NotFound(new { message = "Project not found" });
    }

    return Results.Ok(new ProjectResponse(
        project.Id,
        project.Name,
        project.Description,
        project.CreatedAtUtc,
        project.DueDateUtc,
        project.CreatedByUserId,
        project.ParticipatingUsers.Select(user => user.Id).ToList()));
});

projects.MapPost("/", async (CreateProjectRequest request, AppDbContext db) =>
{
    var creatorExists = await db.Users.AnyAsync(user => user.Id == request.CreatedByUserId);
    if (!creatorExists)
    {
        return Results.BadRequest(new { message = "CreatedByUserId is invalid" });
    }

    var participantIds = request.ParticipatingUserIds
        .Distinct()
        .ToList();

    var participants = await db.Users
        .Where(user => participantIds.Contains(user.Id))
        .ToListAsync();

    if (participants.Count != participantIds.Count)
    {
        return Results.BadRequest(new { message = "One or more participating user ids are invalid" });
    }

    var project = new AppProject
    {
        Name = request.Name,
        Description = request.Description,
        CreatedAtUtc = DateTime.UtcNow,
        DueDateUtc = request.DueDateUtc,
        CreatedByUserId = request.CreatedByUserId,
        ParticipatingUsers = participants
    };

    db.Projects.Add(project);
    await db.SaveChangesAsync();

    return Results.Created($"/api/projects/{project.Id}", new ProjectResponse(
        project.Id,
        project.Name,
        project.Description,
        project.CreatedAtUtc,
        project.DueDateUtc,
        project.CreatedByUserId,
        project.ParticipatingUsers.Select(user => user.Id).ToList()));
});

projects.MapPut("/{id:int}", async (int id, UpdateProjectRequest request, AppDbContext db) =>
{
    var project = await db.Projects
        .Include(p => p.ParticipatingUsers)
        .FirstOrDefaultAsync(p => p.Id == id);

    if (project is null)
    {
        return Results.NotFound(new { message = "Project not found" });
    }

    var participantIds = request.ParticipatingUserIds
        .Distinct()
        .ToList();

    var participants = await db.Users
        .Where(user => participantIds.Contains(user.Id))
        .ToListAsync();

    if (participants.Count != participantIds.Count)
    {
        return Results.BadRequest(new { message = "One or more participating user ids are invalid" });
    }

    project.Name = request.Name;
    project.Description = request.Description;
    project.DueDateUtc = request.DueDateUtc;
    project.ParticipatingUsers = participants;

    await db.SaveChangesAsync();

    return Results.Ok(new ProjectResponse(
        project.Id,
        project.Name,
        project.Description,
        project.CreatedAtUtc,
        project.DueDateUtc,
        project.CreatedByUserId,
        project.ParticipatingUsers.Select(user => user.Id).ToList()));
});

projects.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
{
    var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == id);
    if (project is null)
    {
        return Results.NotFound(new { message = "Project not found" });
    }

    db.Projects.Remove(project);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

record SignUpRequest(string Username, string Email, string Password);
record SignInRequest(string Email, string Password);
record CreateProjectRequest(
    string Name,
    string Description,
    DateTime DueDateUtc,
    int CreatedByUserId,
    List<int> ParticipatingUserIds);
record UpdateProjectRequest(
    string Name,
    string Description,
    DateTime DueDateUtc,
    List<int> ParticipatingUserIds);
record ProjectResponse(
    int Id,
    string Name,
    string Description,
    DateTime CreatedAtUtc,
    DateTime DueDateUtc,
    int CreatedByUserId,
    List<int> ParticipatingUserIds);
