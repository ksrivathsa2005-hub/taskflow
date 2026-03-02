# Palette's Journal - TaskFlow

## 2025-05-14 - Initial Observations
**Learning:** The application lacks a "Skip to Content" link, which is a critical accessibility feature for keyboard and screen reader users to bypass repetitive navigation.
**Action:** Add a "Skip to Content" link in `app.html` and ensure it is properly styled to be visible only on focus.

**Learning:** Interactive elements like the logo in the Navbar use `cursor-pointer` on a `div` but are not keyboard accessible (no `tabindex`, no `keydown` handlers).
**Action:** Wrap the logo in a `button` or `a` tag, or add appropriate ARIA roles and keyboard listeners.

**Learning:** Form inputs in `PostTaskComponent` have labels but lack `id` attributes that associate them with their respective labels using `for`.
**Action:** Add `id` to inputs and `for` to labels in forms.
