## 2026-02-22 - [Global Accessibility Pass]
**Learning:** Core navigation elements like the logo and icon-only buttons lacked proper keyboard access and ARIA labels. Additionally, a "Skip to Content" link was missing, which is critical for keyboard users in a complex layout with a sticky navbar.
**Action:** Always implement "Skip to Content" links targeting a clear `#main-content` area and ensure all icon-only interactive elements have descriptive `aria-label` attributes.
