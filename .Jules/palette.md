## 2026-03-22 - Global Accessibility Foundation
**Learning:** Screen reader users and keyboard-only users often face significant barriers in "glassmorphism" styled apps where interactive elements are represented by styled divs or icons without labels. A "Skip to Content" link is a low-effort, high-impact win for any Angular app with a sticky navbar.
**Action:** Always verify that interactive elements (like logos and profile groups) are semantic `<button>` tags and include descriptive ARIA labels. Implement a high-z-index skip link in the root template.
