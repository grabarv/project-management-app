import ProjectSummaryCard from "./ProjectSummaryCard/ProjectSummaryCard";
import ProjectTasksSection from "./ProjectTasksSection";
import ProjectInvitationsSection from "../invitations/ProjectInvitationsSection/ProjectInvitationsSection";

/**
 * Project details view shown when no task subview is active.
 */
export default function ProjectDetailsContent({ onOpenProjectDelete, onOpenProjectLeave }) {
  return (
    <article>
      <ProjectSummaryCard
        onOpenProjectDelete={onOpenProjectDelete}
        onOpenProjectLeave={onOpenProjectLeave}
      />
      <ProjectInvitationsSection />
      <ProjectTasksSection />
    </article>
  );
}
