## 2026-05-30 - Accessible Photo Upload Patterns
**Learning:** Hidden file inputs should be paired with semantic buttons for keyboard accessibility, but the input must NOT be nested inside the button to avoid invalid HTML structures and inconsistent screen reader behavior.
**Action:** Always place hidden inputs outside the trigger button, using template reference variables in Angular (or similar refs in other frameworks) to link the two.
