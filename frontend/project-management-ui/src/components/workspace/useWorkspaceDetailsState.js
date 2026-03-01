import { useCallback, useEffect, useState } from "react";

/**
 * Coordinates right-panel state transitions inside the workspace details area.
 */
export function useWorkspaceDetailsState(selectedProject) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskViewMode, setTaskViewMode] = useState("details");
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedTask(null);
    setTaskViewMode("details");
    setIsCreateTaskOpen(false);
  }, [selectedProject?.id]);

  const openTaskDetails = useCallback((task) => {
    setSelectedTask(task);
    setTaskViewMode("details");
  }, []);

  const openTaskEdit = useCallback((task) => {
    setSelectedTask(task);
    setTaskViewMode("edit");
  }, []);

  const closeTaskView = useCallback(() => {
    setSelectedTask(null);
    setTaskViewMode("details");
  }, []);

  const handleTaskUpdated = useCallback((updatedTask) => {
    setSelectedTask(updatedTask);
    setTaskViewMode("details");
    setTasksRefreshKey((value) => value + 1);
  }, []);

  const handleTaskCreated = useCallback((createdTask) => {
    setIsCreateTaskOpen(false);
    setTasksRefreshKey((value) => value + 1);
    setSelectedTask(createdTask);
    setTaskViewMode("details");
  }, []);

  const handleTaskDeleted = useCallback(() => {
    setSelectedTask(null);
    setTaskViewMode("details");
    setTasksRefreshKey((value) => value + 1);
  }, []);

  const toggleCreateTask = useCallback(() => {
    setIsCreateTaskOpen((value) => !value);
  }, []);

  const closeCreateTask = useCallback(() => {
    setIsCreateTaskOpen(false);
  }, []);

  return {
    selectedTask,
    taskViewMode,
    tasksRefreshKey,
    isCreateTaskOpen,
    openTaskDetails,
    openTaskEdit,
    closeTaskView,
    handleTaskUpdated,
    handleTaskCreated,
    handleTaskDeleted,
    toggleCreateTask,
    closeCreateTask,
  };
}
