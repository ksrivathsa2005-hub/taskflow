## 2026-02-26 - [Global Accessibility & Keyboard Navigation]
**Learning:** Adding a "Skip to Content" link and proper ARIA roles to global components (Navbar, Confirm Dialog) significantly improves the experience for keyboard and screen reader users without impacting the visual design.
**Action:** Always include a "Skip to Content" link in the root layout and ensure modal dialogs have `role="alertdialog"` and proper ARIA labeling.

## 2026-02-26 - [Accessible Names & Strict Locators]
**Learning:** Using generic accessible names like "Disputes" for multiple buttons (e.g., a notification bell and a menu item) can cause ambiguity for screen readers and failure in strict-mode automated tests (like Playwright).
**Action:** Use more descriptive ARIA labels (e.g., "Toggle Quick Links", "View Notifications") to ensure unique accessible names for all interactive elements.
