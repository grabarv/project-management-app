import { useEffect, useMemo, useState } from "react";
import { formatDate } from "../utils";
import { fetchProjectTasks } from "../../../services/taskApi";

/**
 * Read-only task table shown under selected project details.
 */
export default function ProjectTasksTable({ currentUser, selectedProject }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
  }, [currentUser, selectedProject]);

  const myTasks = useMemo(() => {
    if (!currentUser?.userId) {
      return [];
    }

    return tasks.filter((task) => task.assignedToUserId === currentUser.userId);
  }, [tasks, currentUser]);

  return (
    <section className="project-tasks-panel">
      <div className="project-tasks-header">
        <h3>My Tasks</h3>
        {!isLoading && !errorMessage && <span>{myTasks.length}</span>}
      </div>

      {isLoading && <p className="workspace-info">Loading tasks...</p>}
      {!isLoading && errorMessage && <p className="workspace-error">{errorMessage}</p>}

      {!isLoading && !errorMessage && myTasks.length === 0 && (
        <p className="workspace-info">No tasks assigned to you in this project.</p>
      )}

      {!isLoading && !errorMessage && myTasks.length > 0 && (
        <div className="tasks-table-wrap">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Assigned User</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {myTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.name}</td>
                  <td>
                    <span className={`task-status status-${String(task.status).toLowerCase()}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>User #{task.assignedToUserId}</td>
                  <td>{formatDate(task.dueDateUtc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
