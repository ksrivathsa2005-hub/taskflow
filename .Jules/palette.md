## 2026-04-11 - Accessible Confirmation Dialogs
**Learning:** Confirmation dialogs often miss critical ARIA attributes and keyboard shortcuts (like Escape), making them difficult for screen reader and keyboard-only users to navigate and dismiss.
**Action:** Always include `role="dialog"`, `aria-modal="true"`, and appropriate `aria-labelledby`/`aria-describedby` links, along with a global Escape key listener for dismissal.
