## 2026-04-26 - Standardizing Accessible Dialogs
**Learning:** Common modal components in the app (like `ConfirmDialogComponent`) were missing standard ARIA roles (`role="alertdialog"`) and keyboard escape hatches, leading to a disconnected experience for keyboard and screen reader users despite using modern Angular control flow.
**Action:** Always ensure modal templates include `role="dialog"` or `role="alertdialog"`, `aria-modal="true"`, and a `window:keydown.escape` listener at the component level to maintain accessibility parity with visual state changes.
