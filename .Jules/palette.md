## 2026-06-04 - [Accessibility and Navigation Polish in Authentication]
**Learning:** Forms in this application often lack explicit `id` and `for` label associations, which hinders screen reader accessibility. Additionally, using `(click)` handlers on buttons for simple cross-page navigation is less semantic than using `routerLink` on anchor tags.
**Action:** Always ensure all form inputs have unique `id` attributes matching their `<label for="...">` counterparts. Prefer `routerLink` for navigation to improve accessibility and browser-native behaviors.
