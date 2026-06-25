## 2026-06-25 - Accessible Star Ratings
**Learning:** Star rating components in this app were implemented as simple button lists, lacking standard ARIA roles and interactive feedback.
**Action:** Use role='radiogroup' for the container and role='radio' for individual stars, with aria-checked reflecting selection. Implement a hoveredRating state to provide visual preview on mouse hover.
