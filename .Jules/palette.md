## 2026-06-21 - [Semantic Navbar Logo]
**Learning:** Using a `div` with a click handler for primary navigation elements like a logo is a common accessibility anti-pattern. Refactoring these to semantic `<button>` or `<a>` tags with proper ARIA labels ensures keyboard accessibility and better screen reader support.
**Action:** Always check the Navbar and other key navigation points for non-semantic interactive elements and refactor them to buttons or links with `focus-visible` styles.

## 2026-06-21 - [Testing Router-Dependent Components]
**Learning:** Unit tests for components that use `routerLink` or inject the `Router` will fail with "No provider found for ActivatedRoute" if the router is not properly provided in the `TestBed`.
**Action:** Use `provideRouter(routes)` in `TestBed.configureTestingModule` and ensure the `Router` is injected to trigger manual navigation before making assertions about rendered content.
