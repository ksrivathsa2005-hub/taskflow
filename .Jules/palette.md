## 2026-03-28 - Accessible Selection Groups

**Learning:** When implementing custom selection UI (like category grids), using semantic HTML (`role="radiogroup"` and `<button role="radio">`) is superior to `div` elements with click handlers. It provides out-of-the-box keyboard support and proper screen reader announcements.

**Action:** Always wrap selection lists in a `radiogroup` and use `[attr.aria-checked]` to communicate state. Ensure `cursor-pointer` is retained on buttons for visual affordance.
