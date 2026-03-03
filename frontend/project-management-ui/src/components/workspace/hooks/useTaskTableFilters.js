import { useMemo, useState } from "react";

/**
 * Holds per-table "not done only" flags and returns filtered task collections.
 */
export function useTaskTableFilters(myTasks, otherUsersTasks) {
  const [showOnlyNotDone, setShowOnlyNotDone] = useState({
    myTasks: false,
    othersTasks: false,
  });

  const filteredMyTasks = useMemo(
    () => (showOnlyNotDone.myTasks ? myTasks.filter((task) => task.status !== "Done") : myTasks),
    [myTasks, showOnlyNotDone.myTasks]
  );

  const filteredOtherUsersTasks = useMemo(
    () =>
      showOnlyNotDone.othersTasks
        ? otherUsersTasks.filter((task) => task.status !== "Done")
        : otherUsersTasks,
    [otherUsersTasks, showOnlyNotDone.othersTasks]
  );

  return {
    showOnlyNotDone,
    setShowOnlyNotDone,
    filteredMyTasks,
    filteredOtherUsersTasks,
  };
}
