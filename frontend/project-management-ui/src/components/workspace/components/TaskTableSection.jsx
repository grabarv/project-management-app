import { formatDate } from "../utils";

/**
 * Reusable task table section used for both "My Tasks" and "Others' Tasks".
 */
export default function TaskTableSection({
  title,
  rows,
  totalCount,
  emptyMessage,
  isLoading,
  errorMessage,
  showOnlyNotDone,
  onToggleShowOnlyNotDone,
  showAssignedBy = false,
  showAssignedTo = false,
  showEditAction = false,
  showDeleteAction = false,
  panelClassName = "",
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
}) {
  return (
    <section className={`project-tasks-panel ${panelClassName}`.trim()}>
      <div className="project-tasks-header">
        <h3>{title}</h3>
        {!isLoading && !errorMessage && <span>{totalCount}</span>}
      </div>

      {totalCount > 0 && (
        <label className="tasks-filter-toggle">
          <input type="checkbox" checked={showOnlyNotDone} onChange={onToggleShowOnlyNotDone} />
          <span>Not done only</span>
        </label>
      )}

      {isLoading && <p className="workspace-info">Loading tasks...</p>}
      {!isLoading && errorMessage && <p className="workspace-error">{errorMessage}</p>}

      {!isLoading && !errorMessage && rows.length === 0 && (
        <p className="workspace-info">{emptyMessage}</p>
      )}

      {!isLoading && !errorMessage && rows.length > 0 && (
        <div className="tasks-table-wrap">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                {showAssignedBy && <th>Assigned By</th>}
                {showAssignedTo && <th>Assigned To</th>}
                <th>Due Date</th>
                {(showEditAction || showDeleteAction) && (
                  <th className="task-actions-column" aria-label="Actions" />
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((task) => (
                <tr
                  key={task.id}
                  className="task-row-clickable"
                  onClick={() => onTaskSelect?.(task)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      onTaskSelect?.(task);
                    }
                  }}
                  tabIndex={0}
                >
                  <td>{task.name}</td>
                  <td>
                    <span className={`task-status status-${String(task.status).toLowerCase()}`}>
                      {task.status}
                    </span>
                  </td>
                  {showAssignedBy && <td>{task.assignedByUsername || "Unknown"}</td>}
                  {showAssignedTo && <td>{task.assignedToUsername || `User #${task.assignedToUserId}`}</td>}
                  <td>{formatDate(task.dueDateUtc)}</td>
                  {(showEditAction || showDeleteAction) && (
                    <td className="task-actions-cell">
                      {showEditAction && (
                        <button
                          type="button"
                          className="task-edit-button"
                          aria-label={`Update task ${task.name}`}
                          title="Update task"
                          onClick={(event) => {
                            event.stopPropagation();
                            onTaskEdit?.(task);
                          }}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              d="M4 4h10v2H6v12h12v-8h2v10H4V4zm11.7 1.3 2 2L10 15H8v-2l7.7-7.7zm1.4-1.4a1 1 0 0 1 1.4 0l1.5 1.5a1 1 0 0 1 0 1.4L18.4 8.4l-2.9-2.9 1.6-1.6z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                      )}
                      {showDeleteAction && (
                        <button
                          type="button"
                          className="task-delete-button"
                          aria-label={`Delete task ${task.name}`}
                          title="Delete task"
                          onClick={(event) => onTaskDelete?.(event, task)}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9zM7 9h2v8H7V9zm1 12a2 2 0 0 1-2-2V8h12v11a2 2 0 0 1-2 2H8z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
