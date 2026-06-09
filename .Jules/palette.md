## 2026-06-09 - [Accessible Interactive Star Rating]
**Learning:** Combining `role="radiogroup"` with a `hoveredRating` state provides both high accessibility and delightful visual feedback. Keyboard users get standard radio behavior, while mouse users get a preview of their selection.
**Action:** Use `role="radiogroup"` for star ratings and implement `mouseenter`/`mouseleave` to drive a temporary visual state that overrides the selected value.
