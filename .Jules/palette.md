## 2024-03-08 - Improving Component Accessibility and Keyboard Navigation

**Learning:** Replacing non-semantic interactive elements (like `div` with `(click)`) with `<button type="button">` is fundamental for accessibility. It provides native keyboard support (Enter/Space) and correctly identifies the element's role to screen readers. Adding `focus-visible:ring-2` ensures that keyboard users have a clear visual indicator of where they are on the page without cluttering the UI for mouse users.

**Action:** Always prefer semantic `<button>` or `<a>` for interactive elements. If a `div` must be used, ensure `tabindex="0"`, `role="button"`, and both `keydown.enter` and `keydown.space` handlers are implemented. Always include `focus-visible` styles for all interactive components.
