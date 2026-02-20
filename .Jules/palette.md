## 2026-02-20 - [Navbar Accessibility]
**Learning:** Using `div` with `(click)` for the navbar logo or other primary navigation elements creates accessibility barriers for keyboard and screen reader users.
**Action:** Replace interactive `div` elements with `<button type="button">` or `<a>`, ensure they have descriptive `aria-label` attributes, and use `focus-visible:ring-2` to provide clear focus states for keyboard users.
