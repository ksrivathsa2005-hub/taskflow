## 2026-06-23 - [Star Rating Hover Preview]
**Learning:** Implement a `hoveredRating` property to temporarily override the visual state of stars during mouse-over. This provides immediate interactive feedback without changing the actual selection until a click occurs.
**Action:** Use `(mouseenter)` and `(mouseleave)` on individual rating elements to manage a temporary preview state.

## 2026-06-23 - [Modal Accessibility and Keyboard Support]
**Learning:** Modal components must implement `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` referencing a title for screen readers. Additionally, they must handle the `Escape` key via `@HostListener('window:keydown.escape')` for easy dismissal by keyboard users.
**Action:** Always include these ARIA attributes and a global keyboard listener when creating or refactoring modal components.
