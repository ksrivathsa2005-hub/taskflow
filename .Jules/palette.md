## 2026-03-12 - [Accessibility Global Styles]
**Learning:** Component-specific CSS files in this Angular setup (like `app.css`) are not bundled as global styles, which prevents utility classes like `sr-only` from working across the entire app if defined there.
**Action:** Use `src/styles.css` for global utility classes and accessibility helpers to ensure they are available to all components and the root layout.
