## 2026-05-07 - Confirm Dialog Accessibility
**Learning:** Modal components like the `ConfirmDialogComponent` must include `role="alertdialog"`, `aria-modal="true"`, and `aria-labelledby` referencing a title with a matching `id` to be fully accessible to screen readers. Additionally, supporting the `Escape` key for dismissal is a standard expectation for modal interactions.
**Action:** Always include these ARIA attributes and keyboard listeners when creating or modifying modal-like components.
