## 2026-05-16 - [PostTaskComponent Accessibility Refactor]
**Learning:** In multi-step forms using Angular, non-semantic div-based steppers and category selectors exclude keyboard and screen reader users. Reusable patterns like using `<nav>` with `aria-current` and `<button role="radio">` in a `radiogroup` significantly improve inclusivity.
**Action:** Always prioritize semantic elements and explicit ARIA roles/labels for interactive components, and ensure form labels are programmatically linked to inputs using `id` and `for` attributes.
