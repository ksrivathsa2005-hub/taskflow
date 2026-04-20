## 2024-05-23 - Accessible Modals and Dialogs
**Learning:** For a modal/dialog to be fully accessible, it requires specific ARIA roles and labels, and importantly, a keyboard escape hatch. Using `role="dialog"`, `aria-modal="true"`, and linking the dialog to its title and description via `aria-labelledby` and `aria-describedby` ensures screen readers correctly identify and describe the modal.
**Action:** Always include `role="dialog"`, `aria-modal="true"`, and a HostListener for the 'Escape' key when creating or enhancing modal components in this application.
