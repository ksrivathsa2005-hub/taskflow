## 2026-03-29 - [Skip to Content Implementation]
**Learning:** Implementing a "Skip to Content" link requires not just the link itself but a corresponding target on the main container with `tabindex="-1"` and `outline-none` to ensure the focus moves correctly without an ugly focus ring around the entire content block. In this app, the high z-index (z-[100]) is also crucial to ensure the link appears above the sticky navbar (z-50) when focused.
**Action:** Always verify that the skip target is correctly identified and that the link is the first focusable element in the DOM.
