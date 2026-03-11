## 2026-03-11 - [Accessibility] Skip to Content and Utility Classes
**Learning:** In projects using Tailwind CSS via CDN, common accessibility utility classes like `sr-only` and `focus:not-sr-only` may not be reliably available or may behave inconsistently if not explicitly defined in the local stylesheet.
**Action:** Always verify the availability of these utilities and define them in `src/app/app.css` if necessary to ensure "Skip to Content" and other visually hidden elements work correctly for both screen readers and keyboard users.

## 2026-03-11 - [UX] Misleading Interactive Cues
**Learning:** Using `cursor-pointer` on non-interactive elements (like static footer links) creates a false expectation of interactivity, leading to user frustration when clicking results in no action.
**Action:** Audit and remove `cursor-pointer` from all static list items or divs that do not have associated click handlers or navigation logic.
