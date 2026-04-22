# Palette's UX Journal

## 2026-04-22 - Enhanced Review Modal Accessibility & Feedback
**Learning:** Modals in this application lacked standard accessibility markers (`role="dialog"`, `aria-modal="true"`) and keyboard "escape" hatches. Star ratings implemented as simple buttons are opaque to screen readers without `role="radio"` and `aria-label`.
**Action:** Always include ARIA roles for custom controls (like star ratings) and implement `Escape` key listeners for all modal interactions to ensure a consistent, accessible experience.
