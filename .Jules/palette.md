## 2025-05-08 - Improving Form Accessibility in Multi-step Wizards
**Learning:** In complex, multi-step forms (like `PostTaskComponent`), standard accessibility features like `for/id` label associations and `aria-current` for steppers are often overlooked but crucial for screen reader users to understand their progress and the context of inputs.
**Action:** Always check for `label` associations and stepper `aria-current` states when working with wizard-style interfaces.
