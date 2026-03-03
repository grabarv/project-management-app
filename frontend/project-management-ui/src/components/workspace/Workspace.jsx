import "./workspace.css";
import WorkspaceSidebar from "./components/sidebar/WorkspaceSidebar";
import WorkspaceDetails from "./components/details/WorkspaceDetails";
import WorkspaceCreateProjectForm from "./components/projects/WorkspaceCreateProjectForm";
import WorkspaceUpdateProjectForm from "./components/projects/WorkspaceUpdateProjectForm";
import { WorkspaceProvider, useWorkspaceContext } from "./WorkspaceContext";

/**
 * Workspace container:
 * - loads user-visible projects
 * - coordinates which right-side panel is active
 * - reacts to create/delete completion callbacks from child views
 */
function WorkspaceLayout() {
  const { activePanel, selectedProject } = useWorkspaceContext();

  return (
    <main className="workspace-layout">
      <WorkspaceSidebar />
      {/* Right side switches between create, edit and details views */}
      {activePanel === "create" ? (
        <WorkspaceCreateProjectForm />
      ) : activePanel === "edit" && selectedProject ? (
        <WorkspaceUpdateProjectForm />
      ) : (
        <WorkspaceDetails />
      )}
    </main>
  );
}

export default function Workspace({ currentUser }) {
  return (
    <WorkspaceProvider currentUser={currentUser}>
      <WorkspaceLayout />
    </WorkspaceProvider>
  );
}
