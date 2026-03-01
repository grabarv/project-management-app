import { useEffect, useMemo, useState } from "react";
import { formatDate } from "../utils";
import { fetchProjectTasks } from "../../../services/taskApi";
import TaskDeleteConfirmModal from "./TaskDeleteConfirmModal";

/**
 * Read-only task table shown under selected project details.
 */
export default function ProjectTasksTable({
  currentUser,
  selectedProject,
  onTaskSelect,
  onTaskEdit,
  onTaskDeleted,
  refreshKey = 0,
}) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [taskPendingDelete, setTaskPendingDelete] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      if (!selectedProject?.id || !currentUser?.userId) {
        if (isMounted) {
          setTasks([]);
          setErrorMessage("");
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      const result = await fetchProjectTasks(selectedProject.id, currentUser.userId);

      if (!isMounted) {
        return;
      }

      if (!result.ok) {
        setTasks([]);
        setErrorMessage(result.message || "Failed to load tasks");
        setIsLoading(false);
        return;
      }

      setTasks(result.data);
      setIsLoading(false);
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [currentUser, selectedProject, refreshKey]);

  const myTasks = useMemo(() => {
    if (!currentUser?.userId) {
      return [];
    }

    return tasks.filter((task) => task.assignedToUserId === currentUser.userId);
  }, [tasks, currentUser]);

  const otherUsersTasks = useMemo(() => {
    if (!currentUser?.userId) {
      return [];
    }

    return tasks.filter((task) => task.assignedToUserId !== currentUser.userId);
  }, [tasks, currentUser]);

  const isCreator = selectedProject?.createdByUserId === currentUser?.userId;

  const handleDeleteTaskClick = (event, task) => {
    event.stopPropagation();
    setTaskPendingDelete(task);
  };

  const renderTaskTable = ({
    title,
    rows,
    emptyMessage,
    showAssignedTo = false,
    showDeleteAction = false,
    showEditAction = false,
    panelClassName = "",
    onTaskSelect,
  }) => (
    <section className={`project-tasks-panel ${panelClassName}`.trim()}>
      <div className="project-tasks-header">
        <h3>{title}</h3>
        {!isLoading && !errorMessage && <span>{rows.length}</span>}
      </div>

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
                {title === "My Tasks" && <th>Assigned By</th>}
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
                  {title === "My Tasks" && <td>{task.assignedByUsername || "Unknown"}</td>}
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
                      <button
                        type="button"
                        className="task-delete-button"
                        aria-label={`Delete task ${task.name}`}
                        title="Delete task"
                        onClick={(event) => handleDeleteTaskClick(event, task)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9zM7 9h2v8H7V9zm1 12a2 2 0 0 1-2-2V8h12v11a2 2 0 0 1-2 2H8z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
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

  return (
    <>
      {renderTaskTable({
        title: "My Tasks",
        rows: myTasks,
        emptyMessage: "No tasks assigned to you in this project.",
        onTaskSelect,
      })}

      {isCreator &&
        renderTaskTable({
          title: "Others' Tasks",
          rows: otherUsersTasks,
          emptyMessage: "No tasks are assigned to other users in this project.",
          showAssignedTo: true,
          showEditAction: true,
          showDeleteAction: true,
          panelClassName: "project-tasks-panel-secondary",
          onTaskSelect,
        })}

      {taskPendingDelete && (
        <TaskDeleteConfirmModal
          taskId={taskPendingDelete.id}
          taskName={taskPendingDelete.name}
          currentUser={currentUser}
          onClose={() => setTaskPendingDelete(null)}
          onDeleted={onTaskDeleted}
        />
      )}
    </>
  );
}
