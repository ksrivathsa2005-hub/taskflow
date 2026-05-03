## 2025-05-03 - Accessible Branding & Semantic Navigation
**Learning:** Using a `div` for the main brand/logo navigation is an accessibility anti-pattern. It prevents keyboard users from easily returning home. Additionally, using `cursor-pointer` on non-interactive elements creates false affordances that confuse users.
**Action:** Always wrap the brand/logo in a semantic `<button>` or `<a>` with an explicit `aria-label`. Ensure all elements with `cursor-pointer` have a corresponding click or keyboard handler.
