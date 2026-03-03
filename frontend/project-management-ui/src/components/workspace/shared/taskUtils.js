/**
 * Builds a unique, sorted list of task assignees from the current user and project participants.
 */
export function buildAssignableUsers(selectedProject, currentUser) {
  const participants = selectedProject?.participatingUsers ?? [];
  const current = currentUser?.userId
    ? [{ id: currentUser.userId, username: `${currentUser.username} (You)` }]
    : [];

  return [...current, ...participants]
    .filter((user, index, array) => array.findIndex((item) => item.id === user.id) === index)
    .sort((a, b) => a.username.localeCompare(b.username));
}
