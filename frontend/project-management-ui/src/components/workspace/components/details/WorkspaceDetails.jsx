import { useWorkspaceContext } from "../../WorkspaceContext";
import { WorkspaceDetailsProvider, useWorkspaceDetailsContext } from "./WorkspaceDetailsContext";
import WorkspaceProjectContent from "./WorkspaceProjectContent";
import WorkspaceTaskContent from "./WorkspaceTaskContent";

/**
 * Right-side project details view with creator-only delete action.
 */
export default function WorkspaceDetails() {
  const { selectedProject } = useWorkspaceContext();

  return (
    <section className="workspace-column workspace-details">
      {!selectedProject ? (
        <div className="workspace-empty-state">
          <h2>Select a project</h2>
          <p>Choose a project name from the left side to view details here.</p>
        </div>
      ) : (
        <WorkspaceDetailsProvider selectedProject={selectedProject}>
          <WorkspaceDetailsBody />
        </WorkspaceDetailsProvider>
      )}
    </section>
  );
}

function WorkspaceDetailsBody() {
  const { selectedTask } = useWorkspaceDetailsContext();

  return selectedTask ? <WorkspaceTaskContent /> : <WorkspaceProjectContent />;
}
