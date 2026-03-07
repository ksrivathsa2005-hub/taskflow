## 2026-03-07 - Skip to Content and Semantic Buttons
**Learning:** In a CDN-based Tailwind environment, utility classes like `sr-only` and `focus:not-sr-only` might not be available or consistent; defining them explicitly in `app.css` ensures robust accessibility. Also, converting clickable `div`s to `button`s is crucial for keyboard focus and screen reader support in the Navbar.
**Action:** Always check for `sr-only` availability when using CDN Tailwind and prefer semantic `<button>` elements for all interactive controls to ensure they are naturally focusable.
