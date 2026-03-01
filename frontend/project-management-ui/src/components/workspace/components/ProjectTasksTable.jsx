import { useEffect, useMemo, useState } from "react";
import { fetchProjectTasks } from "../../../services/taskApi";
import TaskDeleteConfirmModal from "./TaskDeleteConfirmModal";
import TaskTableSection from "./TaskTableSection";

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
  const [showOnlyNotDone, setShowOnlyNotDone] = useState({
    myTasks: false,
    othersTasks: false,
  });

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

  return (
    <>
      <TaskTableSection
        title="My Tasks"
        rows={showOnlyNotDone.myTasks ? myTasks.filter((task) => task.status !== "Done") : myTasks}
        totalCount={showOnlyNotDone.myTasks ? myTasks.filter((task) => task.status !== "Done").length : myTasks.length}
        emptyMessage="No tasks assigned to you in this project."
        isLoading={isLoading}
        errorMessage={errorMessage}
        showOnlyNotDone={showOnlyNotDone.myTasks}
        onToggleShowOnlyNotDone={(event) =>
          setShowOnlyNotDone((prev) => ({
            ...prev,
            myTasks: event.target.checked,
          }))
        }
        showAssignedBy
        onTaskSelect={onTaskSelect}
      />

      {isCreator && (
        <TaskTableSection
          title="Others' Tasks"
          rows={
            showOnlyNotDone.othersTasks
              ? otherUsersTasks.filter((task) => task.status !== "Done")
              : otherUsersTasks
          }
          totalCount={
            showOnlyNotDone.othersTasks
              ? otherUsersTasks.filter((task) => task.status !== "Done").length
              : otherUsersTasks.length
          }
          emptyMessage="No tasks are assigned to other users in this project."
          isLoading={isLoading}
          errorMessage={errorMessage}
          showOnlyNotDone={showOnlyNotDone.othersTasks}
          onToggleShowOnlyNotDone={(event) =>
            setShowOnlyNotDone((prev) => ({
              ...prev,
              othersTasks: event.target.checked,
            }))
          }
          showAssignedTo
          showEditAction
          showDeleteAction
          panelClassName="project-tasks-panel-secondary"
          onTaskSelect={onTaskSelect}
          onTaskEdit={onTaskEdit}
          onTaskDelete={handleDeleteTaskClick}
        />
      )}

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
