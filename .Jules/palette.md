## 2026-06-24 - [Accessible Star Rating with Hover Feedback]
**Learning:** Rating systems using icon-only buttons need `role="radiogroup"` and `role="radio"` with `aria-label` for screen readers. Adding a `hoveredRating` property allows for immediate visual feedback before selection, improving the "feel" of the interaction.
**Action:** Always implement `radiogroup` / `radio` pattern for rating components and include hover states.
