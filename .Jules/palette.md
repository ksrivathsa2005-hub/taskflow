## 2026-06-30 - [Password Visibility Toggle Layout]
**Learning:** When implementing a password visibility toggle overlaid on an input field using absolute positioning, the input element must have sufficient horizontal padding (e.g., `pr-12`) to prevent the entered text from overlapping with the toggle icon.
**Action:** Always check and add appropriate right padding to inputs when adding trailing interactive elements.

## 2026-06-30 - [Form Accessibility in Inline Templates]
**Learning:** Inline templates in Angular components often miss standard accessibility attributes like `id` and `for` because they are written quickly.
**Action:** Audit and add explicit `id` and `for` associations to all form fields to ensure screen reader compatibility.
