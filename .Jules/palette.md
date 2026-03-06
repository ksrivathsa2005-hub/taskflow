## 2026-03-06 - Skip to Content Pattern
**Learning:** Standard Tailwind utility classes like `sr-only` may not be available if Tailwind is only included via CDN and not a full PostCSS/CLI build with standard configurations. Manual definition ensures consistent behavior for accessibility features.
**Action:** Always verify that accessibility utilities are actually hiding content visually by inspecting screenshots.

## 2026-03-06 - Semantic Interactive Elements
**Learning:** Converting `div` with `(click)` to `button` significantly improves keyboard accessibility (Tab focus and Enter/Space trigger) and provides a better experience for screen readers.
**Action:** Use `button` for all custom interactive controls and add `focus-visible` styles for better keyboard UX.
