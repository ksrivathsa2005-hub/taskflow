## 2026-02-16 - Accessibility Pattern: Non-semantic Interactive Elements
**Learning:** Several components in this app (Navbar logo, Category Selector, Task Cards) use `div` or `span` with `(click)` handlers but lack keyboard navigation support (`tabindex`, `role="button"`, keydown handlers).
**Action:** Prefer using `<button>` or `<a>` tags for all interactive elements. If a non-semantic element must be used, ensure it has `role="button"`, `tabindex="0"`, and both `(keydown.enter)` and `(keydown.space)` handlers.

## 2026-02-16 - Localization: Hardcoded Locales
**Learning:** Formatting methods like `toLocaleString()` and `toLocaleDateString()` were hardcoded to `'en-IN'`, which prevents the UI from respecting the user's browser/system locale settings.
**Action:** Use `undefined` as the first argument to these methods to default to the user's locale, ensuring better internationalization support.
