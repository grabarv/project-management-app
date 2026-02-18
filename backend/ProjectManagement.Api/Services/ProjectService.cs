using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Contracts.Projects;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Models;

namespace ProjectManagement.Api.Services;

public sealed class ProjectService(AppDbContext db) : IProjectService
{
    public async Task<IReadOnlyList<ProjectResponse>> GetAllAsync()
    {
        return await db.Projects
            .AsNoTracking()
            .Include(project => project.ParticipatingUsers)
            .Select(project => ToResponse(project))
            .ToListAsync();
    }

    public async Task<ProjectResponse?> GetByIdAsync(int id)
    {
        var project = await db.Projects
            .AsNoTracking()
            .Include(p => p.ParticipatingUsers)
            .FirstOrDefaultAsync(p => p.Id == id);

        return project is null ? null : ToResponse(project);
    }

    public async Task<OperationResult<ProjectResponse>> CreateAsync(CreateProjectRequest request)
    {
        var creatorExists = await db.Users.AnyAsync(user => user.Id == request.CreatedByUserId);
        if (!creatorExists)
        {
            return OperationResult<ProjectResponse>.Fail(400, "CreatedByUserId is invalid");
        }

        var createdAtUtc = DateTime.UtcNow;
        var dueDateUtc = EnsureUtc(request.DueDateUtc);
        if (dueDateUtc < createdAtUtc)
        {
            return OperationResult<ProjectResponse>.Fail(400, "DueDateUtc cannot be earlier than CreatedAtUtc");
        }

        var participantsResult = await ResolveParticipantsAsync(request.ParticipatingUserIds);
        if (!participantsResult.Success)
        {
            return OperationResult<ProjectResponse>.Fail(participantsResult.StatusCode, participantsResult.Error!);
        }

        var project = new AppProject
        {
            Name = request.Name,
            Description = request.Description,
            CreatedAtUtc = createdAtUtc,
            DueDateUtc = dueDateUtc,
            CreatedByUserId = request.CreatedByUserId,
            ParticipatingUsers = participantsResult.Value!
        };

        db.Projects.Add(project);
        await db.SaveChangesAsync();

        return OperationResult<ProjectResponse>.Created(ToResponse(project));
    }

    public async Task<OperationResult<ProjectResponse>> UpdateAsync(int id, UpdateProjectRequest request)
    {
        var project = await db.Projects
            .Include(p => p.ParticipatingUsers)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null)
        {
            return OperationResult<ProjectResponse>.Fail(404, "Project not found");
        }

        var dueDateUtc = EnsureUtc(request.DueDateUtc);
        if (dueDateUtc < project.CreatedAtUtc)
        {
            return OperationResult<ProjectResponse>.Fail(400, "DueDateUtc cannot be earlier than CreatedAtUtc");
        }

        var participantsResult = await ResolveParticipantsAsync(request.ParticipatingUserIds);
        if (!participantsResult.Success)
        {
            return OperationResult<ProjectResponse>.Fail(participantsResult.StatusCode, participantsResult.Error!);
        }

        project.Name = request.Name;
        project.Description = request.Description;
        project.DueDateUtc = dueDateUtc;
        project.ParticipatingUsers = participantsResult.Value!;

        await db.SaveChangesAsync();

        return OperationResult<ProjectResponse>.Ok(ToResponse(project));
    }

    public async Task<OperationResult<bool>> DeleteAsync(int id)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == id);
        if (project is null)
        {
            return OperationResult<bool>.Fail(404, "Project not found");
        }

        db.Projects.Remove(project);
        await db.SaveChangesAsync();
        return OperationResult<bool>.Ok(true);
    }

    private async Task<OperationResult<List<AppUser>>> ResolveParticipantsAsync(IEnumerable<int> participantIds)
    {
        var uniqueParticipantIds = participantIds
            .Distinct()
            .ToList();

        var participants = await db.Users
            .Where(user => uniqueParticipantIds.Contains(user.Id))
            .ToListAsync();

        if (participants.Count != uniqueParticipantIds.Count)
        {
            return OperationResult<List<AppUser>>.Fail(400, "One or more participating user ids are invalid");
        }

        return OperationResult<List<AppUser>>.Ok(participants);
    }

    private static ProjectResponse ToResponse(AppProject project)
    {
        return new ProjectResponse(
            project.Id,
            project.Name,
            project.Description,
            project.CreatedAtUtc,
            project.DueDateUtc,
            project.CreatedByUserId,
            project.ParticipatingUsers.Select(user => user.Id).ToList());
    }

    private static DateTime EnsureUtc(DateTime dateTime)
    {
        return dateTime.Kind == DateTimeKind.Utc
            ? dateTime
            : dateTime.ToUniversalTime();
    }
}
