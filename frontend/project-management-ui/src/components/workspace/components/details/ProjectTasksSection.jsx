import ProjectTasksTable from "../tasks/ProjectTasksTable";
import WorkspaceCreateTaskForm from "../tasks/WorkspaceCreateTaskForm/WorkspaceCreateTaskForm";
import { useWorkspaceContext } from "../../WorkspaceContext";
import { useWorkspaceDetailsContext } from "./WorkspaceDetailsContext";

/**
 * Renders the task-management area for the selected project.
 */
export default function ProjectTasksSection() {
  const { isCreator } = useWorkspaceContext();
  const { isCreateTaskOpen } = useWorkspaceDetailsContext();

  return (
    <>
      {isCreator && isCreateTaskOpen && <WorkspaceCreateTaskForm />}
      <ProjectTasksTable />
    </>
  );
}
