import { useState } from "react";
import ProjectTasksContent from "./ProjectTasksContent";
import TaskDeleteConfirmModal from "./TaskDeleteConfirmModal";

/**
 * Thin task-table container that owns delete-modal state.
 */
export default function ProjectTasksTable() {
  const [taskPendingDelete, setTaskPendingDelete] = useState(null);

  const handleDeleteTaskClick = (event, task) => {
    event.stopPropagation();
    setTaskPendingDelete(task);
  };

  return (
    <>
      <ProjectTasksContent onTaskDelete={handleDeleteTaskClick} />

      {taskPendingDelete && (
        <TaskDeleteConfirmModal
          taskId={taskPendingDelete.id}
          taskName={taskPendingDelete.name}
          onClose={() => setTaskPendingDelete(null)}
        />
      )}
    </>
  );
}
