import "./ConfirmModal.css";

/**
 * Reusable confirmation modal shell for destructive actions.
 */
export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Delete",
  submittingLabel = "Deleting...",
  isSubmitting = false,
  onClose,
  onConfirm,
}) {
  const dialogTitleId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id={dialogTitleId}>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" className="neutral" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="danger" disabled={isSubmitting} onClick={onConfirm}>
            {isSubmitting ? submittingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
