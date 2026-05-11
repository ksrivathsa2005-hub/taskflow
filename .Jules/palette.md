## 2025-05-11 - Accessible Category Selection Pattern
**Learning:** In multi-step forms using Angular, static `div` elements for selection are invisible to screen readers and non-navigable via keyboard. Converting them to semantic `button` elements with `role="radio"` (or `checkbox`) and `aria-checked` states provides immediate accessibility wins without disrupting the visual design.
**Action:** Always prefer semantic `<button>` elements for selectable items and group them with `role="radiogroup"` or `role="group"` with an associated label.

## 2025-05-11 - Interactive File Uploads for A11y
**Learning:** Hidden `<input type="file">` elements are standard for styling file uploads, but the trigger must be a keyboard-accessible element (like a `<button>`) with proper ARIA labeling. Relying on `div` clicks or `label` alone can lead to poor focus management.
**Action:** Use a `<button type="button">` with `aria-labelledby` or `aria-label` to trigger the hidden file input's `click()` event, ensuring the upload interaction is available to all users.
