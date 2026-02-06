## 2026-02-06 - [Angular A11y & ARIA bindings]
**Learning:** In Angular, binding to ARIA attributes must use the attribute binding syntax `[attr.aria-xxx]` because these are not standard DOM properties that can be bound as properties. Also, converting clickable `div` elements to `button` elements is essential for keyboard accessibility but require careful styling to maintain design (e.g., glassmorphism).
**Action:** Always use `[attr.aria-label]` or `[attr.aria-expanded]` and prefer semantic `<button>` or `<a>` tags for interactive elements.
