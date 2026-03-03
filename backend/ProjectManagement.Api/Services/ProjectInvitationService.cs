using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Contracts.ProjectInvitations;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Models;

namespace ProjectManagement.Api.Services;

public sealed class ProjectInvitationService(AppDbContext db) : IProjectInvitationService
{
    public async Task<IReadOnlyList<ProjectInvitationResponse>> GetReceivedAsync(int currentUserId)
    {
        return await db.ProjectInvitations
            .AsNoTracking()
            .Include(invitation => invitation.Project)
            .Include(invitation => invitation.InvitedUser)
            .Include(invitation => invitation.InvitedByUser)
            .Where(invitation => invitation.InvitedUserId == currentUserId)
            .OrderBy(invitation => invitation.Status)
            .ThenByDescending(invitation => invitation.CreatedAtUtc)
            .Select(invitation => ToResponse(invitation))
            .ToListAsync();
    }

    public async Task<OperationResult<IReadOnlyList<ProjectInvitationResponse>>> GetForProjectAsync(int projectId, int currentUserId)
    {
        var project = await db.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project is null)
        {
            return OperationResult<IReadOnlyList<ProjectInvitationResponse>>.Fail(404, "Project not found");
        }

        if (project.CreatedByUserId != currentUserId)
        {
            return OperationResult<IReadOnlyList<ProjectInvitationResponse>>.Fail(
                403,
                "Only project creator can view project invitations");
        }

        var invitations = await db.ProjectInvitations
            .AsNoTracking()
            .Include(invitation => invitation.Project)
            .Include(invitation => invitation.InvitedUser)
            .Include(invitation => invitation.InvitedByUser)
            .Where(invitation => invitation.ProjectId == projectId)
            .OrderBy(invitation => invitation.Status)
            .ThenByDescending(invitation => invitation.CreatedAtUtc)
            .Select(invitation => ToResponse(invitation))
            .ToListAsync();

        return OperationResult<IReadOnlyList<ProjectInvitationResponse>>.Ok(invitations);
    }

    public async Task<OperationResult<ProjectInvitationResponse>> CreateAsync(
        int projectId,
        CreateProjectInvitationRequest request,
        int currentUserId)
    {
        var project = await db.Projects
            .Include(p => p.ParticipatingUsers)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project is null)
        {
            return OperationResult<ProjectInvitationResponse>.Fail(404, "Project not found");
        }

        if (project.CreatedByUserId != currentUserId)
        {
            return OperationResult<ProjectInvitationResponse>.Fail(403, "Only project creator can invite users");
        }

        var normalizedUsername = request.InvitedUsername.Trim();
        if (string.IsNullOrWhiteSpace(normalizedUsername))
        {
            return OperationResult<ProjectInvitationResponse>.Fail(400, "InvitedUsername is required");
        }

        var invitedUser = await db.Users.FirstOrDefaultAsync(user => user.Username == normalizedUsername);
        if (invitedUser is null)
        {
            return OperationResult<ProjectInvitationResponse>.Fail(400, "InvitedUsername is invalid");
        }

        if (invitedUser.Id == currentUserId)
        {
            return OperationResult<ProjectInvitationResponse>.Fail(400, "Project creator cannot invite themselves");
        }

        if (project.ParticipatingUsers.Any(user => user.Id == invitedUser.Id))
        {
            return OperationResult<ProjectInvitationResponse>.Fail(400, "User is already a participant");
        }

        var pendingExists = await db.ProjectInvitations.AnyAsync(invitation =>
            invitation.ProjectId == projectId &&
            invitation.InvitedUserId == invitedUser.Id &&
            invitation.Status == ProjectInvitationStatus.Pending.ToString());

        if (pendingExists)
        {
            return OperationResult<ProjectInvitationResponse>.Fail(400, "A pending invitation already exists for this user");
        }

        var invitation = new AppProjectInvitation
        {
            ProjectId = projectId,
            InvitedUserId = invitedUser.Id,
            InvitedByUserId = currentUserId,
            Status = ProjectInvitationStatus.Pending.ToString(),
            CreatedAtUtc = DateTime.UtcNow
        };

        db.ProjectInvitations.Add(invitation);
        await db.SaveChangesAsync();

        await db.Entry(invitation).Reference(item => item.Project).LoadAsync();
        await db.Entry(invitation).Reference(item => item.InvitedUser).LoadAsync();
        await db.Entry(invitation).Reference(item => item.InvitedByUser).LoadAsync();

        return OperationResult<ProjectInvitationResponse>.Created(ToResponse(invitation));
    }

    public async Task<OperationResult<ProjectInvitationResponse>> AcceptAsync(int invitationId, int currentUserId)
    {
        var invitation = await db.ProjectInvitations
            .Include(item => item.Project)
                .ThenInclude(project => project.ParticipatingUsers)
            .Include(item => item.InvitedUser)
            .Include(item => item.InvitedByUser)
            .FirstOrDefaultAsync(item => item.Id == invitationId);

        if (invitation is null)
        {
            return OperationResult<ProjectInvitationResponse>.Fail(404, "Invitation not found");
        }

        if (invitation.InvitedUserId != currentUserId)
        {
            return OperationResult<ProjectInvitationResponse>.Fail(403, "Only invited user can accept this invitation");
        }

        if (invitation.Status != ProjectInvitationStatus.Pending.ToString())
        {
            return OperationResult<ProjectInvitationResponse>.Fail(400, "Only pending invitations can be accepted");
        }

        if (!invitation.Project.ParticipatingUsers.Any(user => user.Id == currentUserId))
        {
            var invitedUser = await db.Users.FirstAsync(user => user.Id == currentUserId);
            invitation.Project.ParticipatingUsers.Add(invitedUser);
        }

        invitation.Status = ProjectInvitationStatus.Accepted.ToString();
        invitation.RespondedAtUtc = DateTime.UtcNow;

        await db.SaveChangesAsync();

        await db.Entry(invitation).Reference(item => item.Project).LoadAsync();

        return OperationResult<ProjectInvitationResponse>.Ok(ToResponse(invitation));
    }

    public async Task<OperationResult<ProjectInvitationResponse>> DeclineAsync(int invitationId, int currentUserId)
    {
        var invitation = await db.ProjectInvitations
            .Include(item => item.Project)
            .Include(item => item.InvitedUser)
            .Include(item => item.InvitedByUser)
            .FirstOrDefaultAsync(item => item.Id == invitationId);

        if (invitation is null)
        {
            return OperationResult<ProjectInvitationResponse>.Fail(404, "Invitation not found");
        }

        if (invitation.InvitedUserId != currentUserId)
        {
            return OperationResult<ProjectInvitationResponse>.Fail(403, "Only invited user can decline this invitation");
        }

        if (invitation.Status != ProjectInvitationStatus.Pending.ToString())
        {
            return OperationResult<ProjectInvitationResponse>.Fail(400, "Only pending invitations can be declined");
        }

        invitation.Status = ProjectInvitationStatus.Declined.ToString();
        invitation.RespondedAtUtc = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return OperationResult<ProjectInvitationResponse>.Ok(ToResponse(invitation));
    }

    public async Task<OperationResult<ProjectInvitationResponse>> CancelAsync(int invitationId, int currentUserId)
    {
        var invitation = await db.ProjectInvitations
            .Include(item => item.Project)
            .Include(item => item.InvitedUser)
            .Include(item => item.InvitedByUser)
            .FirstOrDefaultAsync(item => item.Id == invitationId);

        if (invitation is null)
        {
            return OperationResult<ProjectInvitationResponse>.Fail(404, "Invitation not found");
        }

        if (invitation.Project.CreatedByUserId != currentUserId)
        {
            return OperationResult<ProjectInvitationResponse>.Fail(403, "Only project creator can cancel invitations");
        }

        if (invitation.Status != ProjectInvitationStatus.Pending.ToString())
        {
            return OperationResult<ProjectInvitationResponse>.Fail(400, "Only pending invitations can be canceled");
        }

        invitation.Status = ProjectInvitationStatus.Canceled.ToString();
        invitation.RespondedAtUtc = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return OperationResult<ProjectInvitationResponse>.Ok(ToResponse(invitation));
    }

    private static ProjectInvitationResponse ToResponse(AppProjectInvitation invitation)
    {
        return new ProjectInvitationResponse(
            invitation.Id,
            invitation.ProjectId,
            invitation.Project.Name,
            invitation.InvitedUserId,
            invitation.InvitedUser.Username,
            invitation.InvitedByUserId,
            invitation.InvitedByUser.Username,
            invitation.Status,
            invitation.CreatedAtUtc,
            invitation.RespondedAtUtc);
    }
}
