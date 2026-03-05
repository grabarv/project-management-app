import ProjectSummaryCard from "./ProjectSummaryCard/ProjectSummaryCard";
import ProjectTasksSection from "./ProjectTasksSection";
import ProjectInvitationsSection from "../invitations/ProjectInvitationsSection/ProjectInvitationsSection";

/**
 * Project details view shown when no task subview is active.
 */
export default function ProjectDetailsContent({ onOpenProjectDelete }) {
  return (
    <article>
      <ProjectSummaryCard onOpenProjectDelete={onOpenProjectDelete} />
      <ProjectInvitationsSection />
      <ProjectTasksSection />
    </article>
  );
}
