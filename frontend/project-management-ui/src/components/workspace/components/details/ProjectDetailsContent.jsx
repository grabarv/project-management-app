import ProjectSummaryCard from "./ProjectSummaryCard";
import ProjectTasksSection from "./ProjectTasksSection";

/**
 * Project details view shown when no task subview is active.
 */
export default function ProjectDetailsContent({
  isCreateTaskOpen,
  onToggleCreateTask,
  onOpenProjectDelete,
  onTaskCreated,
  onCancelCreateTask,
  onTaskSelect,
  onTaskEdit,
  onTaskDeleted,
  tasksRefreshKey,
}) {
  return (
    <article>
      <ProjectSummaryCard
        isCreateTaskOpen={isCreateTaskOpen}
        onToggleCreateTask={onToggleCreateTask}
        onOpenProjectDelete={onOpenProjectDelete}
      />
      <ProjectTasksSection
        isCreateTaskOpen={isCreateTaskOpen}
        onTaskCreated={onTaskCreated}
        onCancelCreateTask={onCancelCreateTask}
        onTaskSelect={onTaskSelect}
        onTaskEdit={onTaskEdit}
        onTaskDeleted={onTaskDeleted}
        tasksRefreshKey={tasksRefreshKey}
      />
    </article>
  );
}
