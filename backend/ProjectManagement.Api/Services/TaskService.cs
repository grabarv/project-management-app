using Microsoft.EntityFrameworkCore;
using ProjectManagement.Api.Contracts.Tasks;
using ProjectManagement.Api.Data;
using ProjectManagement.Api.Models;

namespace ProjectManagement.Api.Services;

public sealed class TaskService(AppDbContext db) : ITaskService
{
    public async Task<OperationResult<IReadOnlyList<TaskResponse>>> GetByProjectAsync(int projectId, int currentUserId)
    {
        var project = await db.Projects
            .AsNoTracking()
            .Include(p => p.ParticipatingUsers)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project is null)
        {
            return OperationResult<IReadOnlyList<TaskResponse>>.Fail(404, "Project not found");
        }

        if (!CanAccessProject(project, currentUserId))
        {
            return OperationResult<IReadOnlyList<TaskResponse>>.Fail(403, "You do not have access to this project");
        }

        var tasks = await db.Tasks
            .AsNoTracking()
            .Where(task => task.ProjectId == projectId)
            .OrderBy(task => task.DueDateUtc)
            .ThenBy(task => task.Id)
            .Select(task => ToResponse(task))
            .ToListAsync();

        return OperationResult<IReadOnlyList<TaskResponse>>.Ok(tasks);
    }

    public async Task<OperationResult<TaskResponse>> GetByIdAsync(int id, int currentUserId)
    {
        var task = await db.Tasks
            .AsNoTracking()
            .Include(t => t.Project)
                .ThenInclude(p => p.ParticipatingUsers)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task is null)
        {
            return OperationResult<TaskResponse>.Fail(404, "Task not found");
        }

        if (!CanAccessProject(task.Project, currentUserId))
        {
            return OperationResult<TaskResponse>.Fail(403, "You do not have access to this task");
        }

        return OperationResult<TaskResponse>.Ok(ToResponse(task));
    }

    public async Task<OperationResult<TaskResponse>> CreateAsync(int projectId, CreateTaskRequest request, int currentUserId)
    {
        var project = await db.Projects
            .Include(p => p.ParticipatingUsers)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project is null)
        {
            return OperationResult<TaskResponse>.Fail(404, "Project not found");
        }

        if (project.CreatedByUserId != currentUserId)
        {
            return OperationResult<TaskResponse>.Fail(403, "Only project creator can create tasks");
        }

        if (!IsAllowedAssignee(project, request.AssignedToUserId))
        {
            return OperationResult<TaskResponse>.Fail(
                400,
                "AssignedToUserId must be the project creator or a project participant");
        }

        var dueDateUtc = EnsureUtc(request.DueDateUtc);
        var createdAtUtc = DateTime.UtcNow;
        // Task due date is a calendar-day input in UI (same convention as projects).
        if (dueDateUtc.Date < createdAtUtc.Date)
        {
            return OperationResult<TaskResponse>.Fail(400, "DueDateUtc cannot be earlier than CreatedAtUtc");
        }

        var task = new AppTask
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            CreatedAtUtc = createdAtUtc,
            DueDateUtc = dueDateUtc,
            ProjectId = project.Id,
            AssignedToUserId = request.AssignedToUserId
        };

        db.Tasks.Add(task);

        try
        {
            await db.SaveChangesAsync();
        }
        catch (InvalidOperationException exception)
        {
            return OperationResult<TaskResponse>.Fail(400, exception.Message);
        }

        return OperationResult<TaskResponse>.Created(ToResponse(task));
    }

    public async Task<OperationResult<TaskResponse>> UpdateAsync(int id, UpdateTaskRequest request, int currentUserId)
    {
        var task = await db.Tasks
            .Include(t => t.Project)
                .ThenInclude(p => p.ParticipatingUsers)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task is null)
        {
            return OperationResult<TaskResponse>.Fail(404, "Task not found");
        }

        if (task.Project.CreatedByUserId != currentUserId)
        {
            return OperationResult<TaskResponse>.Fail(403, "Only project creator can update tasks");
        }

        if (!IsAllowedAssignee(task.Project, request.AssignedToUserId))
        {
            return OperationResult<TaskResponse>.Fail(
                400,
                "AssignedToUserId must be the project creator or a project participant");
        }

        var dueDateUtc = EnsureUtc(request.DueDateUtc);
        if (dueDateUtc.Date < task.CreatedAtUtc.Date)
        {
            return OperationResult<TaskResponse>.Fail(400, "DueDateUtc cannot be earlier than CreatedAtUtc");
        }

        task.Name = request.Name.Trim();
        task.Description = request.Description.Trim();
        task.DueDateUtc = dueDateUtc;
        task.AssignedToUserId = request.AssignedToUserId;

        try
        {
            await db.SaveChangesAsync();
        }
        catch (InvalidOperationException exception)
        {
            return OperationResult<TaskResponse>.Fail(400, exception.Message);
        }

        return OperationResult<TaskResponse>.Ok(ToResponse(task));
    }

    public async Task<OperationResult<bool>> DeleteAsync(int id, int currentUserId)
    {
        var task = await db.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task is null)
        {
            return OperationResult<bool>.Fail(404, "Task not found");
        }

        if (task.Project.CreatedByUserId != currentUserId)
        {
            return OperationResult<bool>.Fail(403, "Only project creator can delete tasks");
        }

        db.Tasks.Remove(task);
        await db.SaveChangesAsync();

        return OperationResult<bool>.Ok(true);
    }

    private static TaskResponse ToResponse(AppTask task)
    {
        return new TaskResponse(
            task.Id,
            task.Name,
            task.Description,
            task.CreatedAtUtc,
            task.DueDateUtc,
            task.ProjectId,
            task.AssignedToUserId);
    }

    private static bool CanAccessProject(AppProject project, int currentUserId)
    {
        return project.CreatedByUserId == currentUserId ||
               project.ParticipatingUsers.Any(user => user.Id == currentUserId);
    }

    private static bool IsAllowedAssignee(AppProject project, int assignedToUserId)
    {
        return project.CreatedByUserId == assignedToUserId ||
               project.ParticipatingUsers.Any(user => user.Id == assignedToUserId);
    }

    private static DateTime EnsureUtc(DateTime dateTime)
    {
        return dateTime.Kind == DateTimeKind.Utc
            ? dateTime
            : dateTime.ToUniversalTime();
    }
}
