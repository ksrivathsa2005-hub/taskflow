## 2026-02-17 - [Global Accessibility & Test Integrity]

**Learning:** This application was missing fundamental accessibility patterns like a "Skip to Content" link and keyboard-accessible navigation (logo was a `div`). Additionally, the main component tests were broken due to missing dependency providers and outdated expectations.

**Action:** Always implement a "Skip to Content" link targeting the main element. Ensure the main element has `tabindex="-1"` and `outline-none` to receive focus programmatically. When converting non-semantic elements to buttons, ensure proper focus styles (`focus-visible`) and ARIA labels. Always verify that global component tests pass by providing `provideRouter` and `provideHttpClient` in `TestBed`.
