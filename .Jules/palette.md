## 2026-05-23 - [Accessible Review Modal]
**Learning:** Implementing `role="radiogroup"` and `role="radio"` for star ratings significantly improves screen reader navigation. Combining these with `aria-labelledby` and explicit form labels ensures the entire modal is contextually clear for assistive technology users. Keyboard accessibility via `Escape` key is a crucial micro-UX touch for modal parity with browser defaults.
**Action:** Always include ARIA roles for custom UI controls and ensure every modal has an `Escape` key listener.
