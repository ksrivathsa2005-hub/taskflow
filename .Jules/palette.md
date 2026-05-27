## 2026-05-27 - [Navbar Accessibility and Logo Feedback]
**Learning:** Converting a clickable `div` to a semantic `<button>` is crucial for keyboard accessibility. However, when using Tailwind's `group-hover`, the `group` class must be explicitly added to the parent element for the child's hover effect to trigger correctly.
**Action:** Always ensure the `group` class is present on the interactive parent when implementing nested hover effects.

## 2026-05-27 - [Unit Test Assertions for Routing Components]
**Learning:** When a component's content depends on the active route (e.g., in a `router-outlet`), unit tests must provide a configured `Router` and trigger an initial navigation to ensure the expected elements are rendered. Assertions should target unique, stable text content from the target page.
**Action:** Use `provideRouter(routes)` in `TestBed` and call `router.navigate([''])` followed by `fixture.detectChanges()` before making assertions on routed content.
