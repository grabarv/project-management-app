import { useState } from "react";
import { formatDate } from "../utils";
import ProjectDeleteConfirmModal from "./ProjectDeleteConfirmModal";

/**
 * Right-side project details view with creator-only delete action.
 */
export default function WorkspaceDetails({
  currentUser,
  selectedProject,
  isCreator,
  onProjectDeleted,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <section className="workspace-column workspace-details">
      {selectedProject ? (
        <article>
          <h2>{selectedProject.name}</h2>
          <p className="project-description">{selectedProject.description}</p>
          <p>
            <strong>Created:</strong> {formatDate(selectedProject.createdAtUtc)}
          </p>
          <p>
            <strong>Due:</strong> {formatDate(selectedProject.dueDateUtc)}
          </p>
          <div className="project-actions">
            {isCreator ? (
              <button
                type="button"
                className="danger"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete project
              </button>
            ) : (
              <p className="workspace-info">
                You are a participant in this project.
              </p>
            )}
          </div>
        </article>
      ) : (
        <div className="workspace-empty-state">
          <h2>Select a project</h2>
          <p>Choose a project name from the left side to view details here.</p>
        </div>
      )}
      {isDeleteModalOpen && selectedProject && (
        <ProjectDeleteConfirmModal
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          currentUser={currentUser}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={onProjectDeleted}
        />
      )}
    </section>
  );
}
