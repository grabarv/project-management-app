using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Contracts.Projects;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Models;

namespace ProjectManagement.Api.Services;

public sealed class ProjectService(AppDbContext db) : IProjectService
{
    public async Task<IReadOnlyList<ProjectResponse>> GetAllAsync(int currentUserId)
    {
        var projects = await db.Projects
            .AsNoTracking()
            .Include(project => project.ParticipatingUsers)
            .Include(project => project.Invitations)
                .ThenInclude(invitation => invitation.InvitedUser)
            .Include(project => project.Invitations)
                .ThenInclude(invitation => invitation.InvitedByUser)
            .Where(project =>
                project.CreatedByUserId == currentUserId ||
                project.ParticipatingUsers.Any(user => user.Id == currentUserId))
            .ToListAsync();

        return projects
            .Select(project => ToResponse(project, currentUserId))
            .ToList();
    }

    public async Task<OperationResult<ProjectResponse>> GetByIdAsync(int id, int currentUserId)
    {
        var project = await db.Projects
            .AsNoTracking()
            .Include(p => p.ParticipatingUsers)
            .Include(p => p.Invitations)
                .ThenInclude(invitation => invitation.InvitedUser)
            .Include(p => p.Invitations)
                .ThenInclude(invitation => invitation.InvitedByUser)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null)
        {
            return OperationResult<ProjectResponse>.Fail(404, "Project not found");
        }

        if (!CanAccess(project, currentUserId))
        {
            return OperationResult<ProjectResponse>.Fail(403, "You do not have access to this project");
        }

        return OperationResult<ProjectResponse>.Ok(ToResponse(project, currentUserId));
    }

    public async Task<OperationResult<ProjectResponse>> CreateAsync(CreateProjectRequest request, int currentUserId)
    {
        if (request.CreatedByUserId != currentUserId)
        {
            return OperationResult<ProjectResponse>.Fail(403, "CreatedByUserId must match the current user");
        }

        // New participants must join through invitation acceptance, not direct project creation payload.
        if (request.ParticipatingUserIds.Count > 0)
        {
            return OperationResult<ProjectResponse>.Fail(
                400,
                "Participants must be invited after project creation");
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

        var project = new AppProject
        {
            Name = request.Name,
            Description = request.Description,
            CreatedAtUtc = createdAtUtc,
            DueDateUtc = dueDateUtc,
            CreatedByUserId = currentUserId
        };

        db.Projects.Add(project);
        await db.SaveChangesAsync();

        return OperationResult<ProjectResponse>.Created(ToResponse(project, currentUserId));
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

        // Accepted participants are managed via invitation workflow now.
        if (request.ParticipatingUserIds.Count > 0)
        {
            return OperationResult<ProjectResponse>.Fail(
                400,
                "Participants must be managed through invitations");
        }

        var dueDateUtc = EnsureUtc(request.DueDateUtc);
        // Due date is day-based input in UI, so validate at date granularity.
        if (dueDateUtc.Date < project.CreatedAtUtc.Date)
        {
            return OperationResult<ProjectResponse>.Fail(400, "DueDateUtc cannot be earlier than CreatedAtUtc");
        }

        project.Name = request.Name;
        project.Description = request.Description;
        project.DueDateUtc = dueDateUtc;

        await db.SaveChangesAsync();

        return OperationResult<ProjectResponse>.Ok(ToResponse(project, currentUserId));
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

    public async Task<OperationResult<ProjectResponse>> RemoveParticipantAsync(
        int projectId,
        int participantUserId,
        int currentUserId)
    {
        var project = await db.Projects
            .Include(item => item.ParticipatingUsers)
            .Include(item => item.Invitations)
                .ThenInclude(invitation => invitation.InvitedUser)
            .Include(item => item.Invitations)
                .ThenInclude(invitation => invitation.InvitedByUser)
            .FirstOrDefaultAsync(item => item.Id == projectId);

        if (project is null)
        {
            return OperationResult<ProjectResponse>.Fail(404, "Project not found");
        }

        if (project.CreatedByUserId != currentUserId)
        {
            return OperationResult<ProjectResponse>.Fail(403, "Only project creator can remove participants");
        }

        if (participantUserId == project.CreatedByUserId)
        {
            return OperationResult<ProjectResponse>.Fail(400, "Project creator cannot be removed");
        }

        var participant = project.ParticipatingUsers.FirstOrDefault(user => user.Id == participantUserId);
        if (participant is null)
        {
            return OperationResult<ProjectResponse>.Fail(404, "Participant not found");
        }

        project.ParticipatingUsers.Remove(participant);

        // Tasks assigned to the removed participant are no longer valid for the project.
        var participantTasks = await db.Tasks
            .Where(task => task.ProjectId == projectId && task.AssignedToUserId == participantUserId)
            .ToListAsync();

        if (participantTasks.Count > 0)
        {
            db.Tasks.RemoveRange(participantTasks);
        }

        await db.SaveChangesAsync();

        return OperationResult<ProjectResponse>.Ok(ToResponse(project, currentUserId));
    }

    private static ProjectResponse ToResponse(AppProject project, int currentUserId)
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
                .ToList(),
            project.CreatedByUserId == currentUserId
                ? project.Invitations
                    .OrderByDescending(invitation => invitation.CreatedAtUtc)
                    .Select(invitation => new ProjectInvitationSummaryResponse(
                        invitation.Id,
                        invitation.InvitedUserId,
                        invitation.InvitedUser.Username,
                        invitation.InvitedByUserId,
                        invitation.InvitedByUser.Username,
                        invitation.Status,
                        invitation.CreatedAtUtc,
                        invitation.RespondedAtUtc))
                    .ToList()
                : []);
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
