# Palette's Journal - Critical UX/Accessibility Learnings

This journal records critical UX and accessibility learnings for the TaskFlow repository.

## 2025-05-15 - Initial Journal Setup
**Learning:** Initializing the journal for UX and accessibility tracking as required by the Palette persona.
**Action:** Will record future critical learnings following the specified format.

## 2025-05-15 - Accessible Modals and Star Ratings
**Learning:** Modals and interactive rating components require specific ARIA attributes (`role="dialog"`, `aria-modal`, `role="radiogroup"`, `role="radio"`) and keyboard support (Escape key, focus rings) to be fully accessible and provide a premium UX. Applying `pointer-events-none` to icons within buttons ensures the button remains the consistent click target.
**Action:** Always implement standard ARIA roles, descriptive labels, and keyboard listeners (especially for Escape key dismissal) when creating or modifying modal components or complex interactive inputs like star ratings.
