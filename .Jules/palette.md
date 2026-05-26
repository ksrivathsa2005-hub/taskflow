## 2026-05-26 - [Form Accessibility in Angular Templates]
**Learning:** Structural elements like steppers and category selectors in Angular inline templates often rely on generic `div` elements, which are not keyboard-accessible. Converting these to semantic elements like `<nav>` and `<button>` significantly improves accessibility without affecting the visual design.
**Action:** Always check inline templates for non-semantic interactive elements and replace them with buttons/links while adding appropriate ARIA attributes.
