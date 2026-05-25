## 2025-05-15 - [Accessible Form Patterns in Inline Templates]
**Learning:** Components with inline templates (like PostTaskComponent) often use non-semantic `div` elements for selection UI, which lack keyboard support and ARIA state. Additionally, form labels are frequently not programmatically linked to their inputs.
**Action:** Always replace clickable `div` selection cards with `<button type="button">`, use `aria-pressed` for selection state, and ensure `id`/`for` attributes are present for all form labels.
