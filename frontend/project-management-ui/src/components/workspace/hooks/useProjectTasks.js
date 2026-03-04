import { useEffect, useMemo, useState } from "react";
import { fetchProjectTasks } from "../../../services/taskApi";

/**
 * Loads project tasks for the current user and exposes common derived groups.
 */
export function useProjectTasks(currentUser, selectedProject, refreshKey = 0) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const currentUserId = currentUser?.userId ?? null;
  const selectedProjectId = selectedProject?.id ?? null;

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      if (!selectedProjectId || !currentUserId) {
        if (isMounted) {
          setTasks([]);
          setErrorMessage("");
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      const result = await fetchProjectTasks(selectedProjectId, currentUserId);

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
  }, [currentUserId, selectedProjectId, refreshKey]);

  const myTasks = useMemo(() => {
    if (!currentUserId) {
      return [];
    }

    return tasks.filter((task) => task.assignedToUserId === currentUserId);
  }, [tasks, currentUserId]);

  const otherUsersTasks = useMemo(() => {
    if (!currentUserId) {
      return [];
    }

    return tasks.filter((task) => task.assignedToUserId !== currentUserId);
  }, [tasks, currentUserId]);

  return {
    tasks,
    myTasks,
    otherUsersTasks,
    isLoading,
    errorMessage,
  };
}
