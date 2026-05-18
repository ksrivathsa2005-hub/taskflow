## 2026-05-18 - [Confirm Dialog Accessibility]
**Learning:** Standard confirm dialogs often miss ARIA roles and keyboard listeners, making them inaccessible to screen reader and keyboard-only users.
**Action:** Always implement `role="alertdialog"`, `aria-modal="true"`, and an 'Escape' key listener for all modal components to ensure baseline accessibility.
