## 2026-02-18 - [Skip to Content & Navbar Accessibility]
**Learning:** Adding a 'Skip to Content' link is a fundamental accessibility win for keyboard users, especially in apps with sticky navbars. Use high z-index and `sr-only focus:not-sr-only` to ensure it's hidden by default but visible on focus. Semantic `<button>` elements for logos ensure they are keyboard-accessible without extra handlers.
**Action:** Always check for 'Skip to Content' links in the main layout and ensure all clickable `div`s are converted to semantic buttons or links.
