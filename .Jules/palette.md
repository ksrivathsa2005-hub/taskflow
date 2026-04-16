# Palette's Journal

## 2026-04-16 - Post-Task Form Accessibility
**Learning:** Complex multi-step forms in this app often lack semantic indicators for the current step and use non-interactive elements (like divs) for selection grids, which breaks keyboard navigation and screen reader support.
**Action:** When implementing or refactoring multi-step forms, ensure `aria-current="step"` is used on the active step and convert selection grids into semantic `radiogroup`s with `button[role="radio"]`.
