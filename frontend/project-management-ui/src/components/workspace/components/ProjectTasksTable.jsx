import { useState } from "react";
import TaskDeleteConfirmModal from "./TaskDeleteConfirmModal";
import TaskTableSection from "./TaskTableSection";
import { useProjectTasks } from "../useProjectTasks";

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
  const [taskPendingDelete, setTaskPendingDelete] = useState(null);
  const [showOnlyNotDone, setShowOnlyNotDone] = useState({
    myTasks: false,
    othersTasks: false,
  });
  const { myTasks, otherUsersTasks, isLoading, errorMessage } = useProjectTasks(
    currentUser,
    selectedProject,
    refreshKey
  );

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
