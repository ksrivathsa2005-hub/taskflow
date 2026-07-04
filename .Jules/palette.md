## 2026-07-04 - [Login Form Accessibility and UX]
**Learning:** Linking labels and inputs via `for` and `id` is crucial for accessibility, especially in inline templates where they are often forgotten. Adding a password visibility toggle significantly improves the user experience during authentication.
**Action:** Always check for `for`/`id` pairs in forms. Implement password toggles for all password fields using absolute positioning and `pr-12` padding on the input.

## 2026-07-04 - [Environment Management]
**Learning:** Committing log files or large lockfiles violates PR hygiene and diff line-count constraints.
**Action:** Explicitly remove `dev_server.log` and `pnpm-lock.yaml` before submission. Restore `packageManager` in `package.json` to match original environment settings.
