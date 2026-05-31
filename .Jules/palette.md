## 2026-05-31 - [Semantic Logo Buttons]
**Learning:** Using a semantic `<button>` instead of a `(click)`-enabled `div` for the main dashboard/logo link significantly improves keyboard accessibility and provides a standard interactive surface for screen readers.
**Action:** Always wrap branding/logo links in a semantic interactive element (button or anchor) with an explicit `aria-label` and `focus-visible` states.
