## 2025-05-13 - [Navbar Accessibility and Keyboard Navigation]
**Learning:** In an Angular/Tailwind project, interactive elements like brand logos that navigate the user should be semantic `<button>` or `<a>` tags rather than `<div>` with click handlers to ensure keyboard focusability. Additionally, custom dropdowns require explicit `@HostListener` for the `Escape` key to meet accessibility standards for "keyboard-closable" overlays.
**Action:** Always prefer semantic interactive tags over clickable divs, and ensure every modal or dropdown has an Escape key listener.
