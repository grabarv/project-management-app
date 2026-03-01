import { useEffect, useMemo, useState } from "react";
import { fetchProjectTasks } from "../../services/taskApi";

/**
 * Loads project tasks for the current user and exposes common derived groups.
 */
export function useProjectTasks(currentUser, selectedProject, refreshKey = 0) {
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

  return {
    tasks,
    myTasks,
    otherUsersTasks,
    isLoading,
    errorMessage,
  };
}
