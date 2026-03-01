## 2026-03-01 - [Improving Global Navigation Accessibility]
**Learning:** Transitioning from `div` with `(click)` to semantic `button` elements significantly improves keyboard discoverability and screen reader support without requiring manual focus management.
**Action:** Always use `<button type="button">` or `<a>` for interactive elements in the navbar and other global components, and ensure they have descriptive `aria-label`s.
