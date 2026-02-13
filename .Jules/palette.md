## 2026-02-13 - [Keyboard Accessibility & Skip Link]
**Learning:** This application follows a glassmorphism design language where many interactive elements are implemented as divs or spans with click handlers, making them inaccessible to keyboard users. A "Skip to Content" link targeting `main#main-content` is a required pattern for this app's layout.
**Action:** Always convert clickable divs/spans in the navbar to buttons with `aria-label` and `focus-visible` rings. Ensure every page has a `main#main-content` target for the global skip link.
