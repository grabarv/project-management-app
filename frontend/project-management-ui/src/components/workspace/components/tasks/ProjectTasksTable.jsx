import { useState } from "react";
import TaskDeleteConfirmModal from "./TaskDeleteConfirmModal";
import TaskTableSection from "./TaskTableSection";
import { useProjectTasks } from "../../hooks/useProjectTasks";
import { useTaskTableFilters } from "../../hooks/useTaskTableFilters";
import { useWorkspaceContext } from "../../WorkspaceContext";

/**
 * Read-only task table shown under selected project details.
 */
export default function ProjectTasksTable({ onTaskSelect, onTaskEdit, onTaskDeleted, refreshKey = 0 }) {
  const { currentUser, selectedProject } = useWorkspaceContext();
  const [taskPendingDelete, setTaskPendingDelete] = useState(null);
  const { myTasks, otherUsersTasks, isLoading, errorMessage } = useProjectTasks(
    currentUser,
    selectedProject,
    refreshKey
  );
  const {
    showOnlyNotDone,
    setShowOnlyNotDone,
    filteredMyTasks,
    filteredOtherUsersTasks,
  } = useTaskTableFilters(myTasks, otherUsersTasks);

  const isCreator = selectedProject?.createdByUserId === currentUser?.userId;

  const handleDeleteTaskClick = (event, task) => {
    event.stopPropagation();
    setTaskPendingDelete(task);
  };

  return (
    <>
      <TaskTableSection
        title="My Tasks"
        rows={filteredMyTasks}
        totalCount={filteredMyTasks.length}
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
          rows={filteredOtherUsersTasks}
          totalCount={filteredOtherUsersTasks.length}
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
          onClose={() => setTaskPendingDelete(null)}
          onDeleted={onTaskDeleted}
        />
      )}
    </>
  );
}
