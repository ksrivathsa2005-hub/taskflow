## 2026-03-27 - [A11y/UX Improvement in Post Task Form]
**Learning:** For single-selection groups like categories, using `role="radio"` and `[attr.aria-checked]` on `<button>` elements within a `role="radiogroup"` is more semantically accurate than generic buttons with `aria-pressed`. This provides better context for screen reader users.

**Action:** When implementing selection grids or lists where only one item can be active, prefer the `radiogroup` and `radio` ARIA roles over generic toggle buttons.
