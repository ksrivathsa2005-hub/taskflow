## 2025-05-02 - Accessibility Foundations for TaskFlow
**Learning:** Standard accessibility patterns for this app include a "Skip to Content" link in `src/app/app.html` targeting `main#main-content`. Multi-step processes (steppers) should use `aria-current="step"` to communicate progress, and choice-based selectors (like categories) are best implemented as `role="radiogroup"` with semantic buttons.
**Action:** Always include the skip link in new layouts and ensure all interactive "cards" are implemented as semantic buttons with appropriate ARIA roles and focus states.
