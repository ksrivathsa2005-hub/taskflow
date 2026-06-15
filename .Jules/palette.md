## 2026-06-15 - [ARIA Roles for Radio Group Selection]
**Learning:** When refactoring a selection list (like category selection) from `div` to `button`, use `role="radiogroup"` on the container and `role="radio"` with `aria-checked` on the interactive elements to provide correct semantic feedback to screen readers. Avoid `aria-pressed` in this context as it's intended for independent toggle buttons.
**Action:** Use `role="radiogroup"` + `role="radio"` + `aria-checked` for single-selection list components.
