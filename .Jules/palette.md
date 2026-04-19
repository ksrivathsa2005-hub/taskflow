## 2026-04-19 - [Accessible Confirm Dialogs]
**Learning:** Modal dialogs like confirmation boxes must include `role="dialog"`, `aria-modal="true"`, and appropriate `aria-labelledby`/`aria-describedby` attributes to be properly announced by screen readers. Additionally, they should always be dismissible via the Escape key for keyboard accessibility.
**Action:** Always implement these ARIA roles and a keyboard Escape listener when creating or modifying modal components in this design system.
