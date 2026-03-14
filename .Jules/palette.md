## 2024-03-14 - Skip to Content Pattern
**Learning:** In projects using Tailwind CSS via CDN, standard utility classes like `sr-only` and `focus:not-sr-only` may not be available globally in component-specific CSS files. They must be manually defined in the global `styles.css` to support critical accessibility features like "Skip to Content" links.
**Action:** Always check for the presence of standard A11y utilities when working with CDN-based Tailwind setups and define them globally if missing.
