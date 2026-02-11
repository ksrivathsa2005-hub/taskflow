## 2026-02-11 - [Navbar Accessibility & Skip Link]
**Learning:** The 'Skip to Content' link in `src/app/app.html` uses `sr-only` for concealment and `focus:not-sr-only` for visibility; it must have a high z-index (e.g., `z-[100]`) to ensure it appears above the sticky navbar (`z-50`) during keyboard navigation.
**Action:** Always verify that skip links have a higher z-index than any fixed or sticky headers in the application.

## 2026-02-11 - [Semantic Navigation]
**Learning:** Converting non-semantic interactive elements (like `div` with `(click)`) to `<button>` with `aria-label` is a fundamental accessibility win that improves keyboard discoverability.
**Action:** Proactively audit navigation components for non-semantic click handlers and replace them with proper button or link elements.
