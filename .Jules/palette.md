## 2024-03-18 - [Accessibility: Skip to Content Link]
**Learning:** Adding a "Skip to Content" link is a critical accessibility feature for keyboard-only and screen reader users, especially in apps with complex, sticky navigation bars. Using `sr-only` combined with `focus:not-sr-only` and a high `z-index` ensures the link is only visible when needed and stays on top of other elements.
**Action:** Always include a skip link as the first focusable element in `app.html` for applications with navigation menus.
