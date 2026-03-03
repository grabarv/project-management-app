import ProjectSummaryCard from "./ProjectSummaryCard";
import ProjectTasksSection from "./ProjectTasksSection";

/**
 * Project details view shown when no task subview is active.
 */
export default function ProjectDetailsContent({ onOpenProjectDelete }) {
  return (
    <article>
      <ProjectSummaryCard onOpenProjectDelete={onOpenProjectDelete} />
      <ProjectTasksSection />
    </article>
  );
}
