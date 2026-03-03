import { isValidDateInputValue, toApiDateTime } from "./utils";

export function requireCurrentUserId(currentUser, showError) {
  if (!currentUser?.userId) {
    showError("Missing user information. Please sign in again.");
    return null;
  }

  return currentUser.userId;
}

export function getValidatedDueDateUtc({
  rawValue,
  minDate,
  showError,
  requireDateInputFormat = false,
}) {
  if (requireDateInputFormat && !isValidDateInputValue(rawValue)) {
    showError("Please provide the date in a valid format.");
    return null;
  }

  const dueDateUtc = toApiDateTime(rawValue);
  if (!dueDateUtc) {
    showError("Please provide a valid due date.");
    return null;
  }

  if (minDate && rawValue < minDate) {
    showError("Due date cannot be earlier than creation date.");
    return null;
  }

  return dueDateUtc;
}
