import TaskTableSection from "./TaskTableSection/TaskTableSection";
import { useProjectTasks } from "../../hooks/useProjectTasks";
import { useTaskTableFilters } from "../../hooks/useTaskTableFilters";
import { useWorkspaceContext } from "../../WorkspaceContext";
import { useWorkspaceDetailsContext } from "../details/WorkspaceDetailsContext";

/**
 * Loads, filters, and renders task table sections for the selected project.
 */
export default function ProjectTasksContent({ onTaskDelete }) {
  const { currentUser, selectedProject } = useWorkspaceContext();
  const { openTaskDetails, openTaskEdit, tasksRefreshKey } = useWorkspaceDetailsContext();
  const { myTasks, otherUsersTasks, isLoading, errorMessage } = useProjectTasks(
    currentUser,
    selectedProject,
    tasksRefreshKey
  );
  const {
    showOnlyNotDone,
    setShowOnlyNotDone,
    filteredMyTasks,
    filteredOtherUsersTasks,
  } = useTaskTableFilters(myTasks, otherUsersTasks);

  const isCreator = selectedProject?.createdByUserId === currentUser?.userId;

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
        onTaskSelect={openTaskDetails}
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
          onTaskSelect={openTaskDetails}
          onTaskEdit={openTaskEdit}
          onTaskDelete={onTaskDelete}
        />
      )}
    </>
  );
}
