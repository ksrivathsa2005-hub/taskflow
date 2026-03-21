## 2026-03-21 - [Review Modal Accessibility]
**Learning:** Modal components in this glassmorphism UI require explicit ARIA roles and labels to be correctly identified by screen readers. Interactive rating stars also need `aria-pressed` to communicate their state effectively.
**Action:** Always include `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` when implementing or enhancing modals. Use `aria-pressed` for toggle-like selection controls like star ratings.
