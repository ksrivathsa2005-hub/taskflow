# Palette's UX Journal

## 2025-05-15 - [A11y Pattern: Non-semantic Interactive Elements]
**Learning:** Several components in this app (like `PostTaskComponent` and category selectors) use `div` elements with `(click)` handlers instead of semantic `<button>` elements. This breaks keyboard navigation and screen reader support.
**Action:** Always refactor interactive `div` elements to `<button type="button">` or appropriate semantic elements, and use ARIA roles like `radiogroup`/`radio` for selection lists.

## 2025-05-15 - [A11y Pattern: Missing Label Associations]
**Learning:** Form labels in this app often lack the `for` attribute, and inputs often lack matching `id` attributes, preventing screen readers from correctly associating labels with their inputs.
**Action:** Ensure every form input has a unique `id` and its corresponding label has a matching `for` attribute.
