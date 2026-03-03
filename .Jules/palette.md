## 2026-03-03 - [Skip to Content Link Accessibility]
**Learning:** Keyboard and screen reader users need a way to bypass repetitive navigation links. Implementing a "Skip to Content" link as the first focusable element solves this. In this app, the link required a high z-index (z-[100]) to appear above the sticky glassmorphic navbar (z-50) when focused.
**Action:** Always ensure a skip link is present in the root `app.html`, targeting a main element with `id="main-content"` and `tabindex="-1"` to facilitate immediate navigation to the primary page content.
