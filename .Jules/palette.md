## 2026-02-27 - Navbar Keyboard Accessibility
**Learning:** Interactive elements in the Navbar (logo, profile, icon buttons) were using `div` with `(click)` handlers, making them inaccessible to keyboard users and screen readers.
**Action:** Always use `<button type="button">` for interactive elements that are not links. Add `aria-label` to icon-only buttons and use `focus-visible` for clear focus states that only appear for keyboard users.
