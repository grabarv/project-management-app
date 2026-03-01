using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Contracts.Projects;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Models;

namespace ProjectManagement.Api.Services;

public sealed class ProjectService(AppDbContext db) : IProjectService
{
    public async Task<IReadOnlyList<ProjectResponse>> GetAllAsync(int currentUserId)
    {
        return await db.Projects
            .AsNoTracking()
            .Include(project => project.ParticipatingUsers)
            .Where(project =>
                project.CreatedByUserId == currentUserId ||
                project.ParticipatingUsers.Any(user => user.Id == currentUserId))
            .Select(project => ToResponse(project))
            .ToListAsync();
    }

    public async Task<OperationResult<ProjectResponse>> GetByIdAsync(int id, int currentUserId)
    {
        var project = await db.Projects
            .AsNoTracking()
            .Include(p => p.ParticipatingUsers)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null)
        {
            return OperationResult<ProjectResponse>.Fail(404, "Project not found");
        }

        if (!CanAccess(project, currentUserId))
        {
            return OperationResult<ProjectResponse>.Fail(403, "You do not have access to this project");
        }

        return OperationResult<ProjectResponse>.Ok(ToResponse(project));
    }

    public async Task<OperationResult<ProjectResponse>> CreateAsync(CreateProjectRequest request, int currentUserId)
    {
        if (request.CreatedByUserId != currentUserId)
        {
            return OperationResult<ProjectResponse>.Fail(403, "CreatedByUserId must match the current user");
        }

        var creatorExists = await db.Users.AnyAsync(user => user.Id == currentUserId);
        if (!creatorExists)
        {
            return OperationResult<ProjectResponse>.Fail(400, "CreatedByUserId is invalid");
        }

        var createdAtUtc = DateTime.UtcNow;
        var dueDateUtc = EnsureUtc(request.DueDateUtc);
        // Compare by calendar day so "today" stays valid regardless of current clock time.
        if (dueDateUtc.Date < createdAtUtc.Date)
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
            CreatedByUserId = currentUserId,
            ParticipatingUsers = participantsResult.Value!
        };

        db.Projects.Add(project);
        await db.SaveChangesAsync();

        return OperationResult<ProjectResponse>.Created(ToResponse(project));
    }

    public async Task<OperationResult<ProjectResponse>> UpdateAsync(int id, UpdateProjectRequest request, int currentUserId)
    {
        var project = await db.Projects
            .Include(p => p.ParticipatingUsers)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null)
        {
            return OperationResult<ProjectResponse>.Fail(404, "Project not found");
        }

        if (project.CreatedByUserId != currentUserId)
        {
            return OperationResult<ProjectResponse>.Fail(403, "Only project creator can update this project");
        }

        var dueDateUtc = EnsureUtc(request.DueDateUtc);
        // Due date is day-based input in UI, so validate at date granularity.
        if (dueDateUtc.Date < project.CreatedAtUtc.Date)
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

    public async Task<OperationResult<bool>> DeleteAsync(int id, int currentUserId)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == id);
        if (project is null)
        {
            return OperationResult<bool>.Fail(404, "Project not found");
        }

        if (project.CreatedByUserId != currentUserId)
        {
            return OperationResult<bool>.Fail(403, "Only project creator can delete this project");
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
            project.ParticipatingUsers.Select(user => user.Id).ToList(),
            project.ParticipatingUsers
                .OrderBy(user => user.Username)
                .Select(user => new ProjectParticipantResponse(user.Id, user.Username))
                .ToList());
    }

    private static DateTime EnsureUtc(DateTime dateTime)
    {
        return dateTime.Kind == DateTimeKind.Utc
            ? dateTime
            : dateTime.ToUniversalTime();
    }

    private static bool CanAccess(AppProject project, int currentUserId)
    {
        return project.CreatedByUserId == currentUserId ||
               project.ParticipatingUsers.Any(user => user.Id == currentUserId);
    }
}
