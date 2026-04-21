## 2026-04-21 - Standardizing Modal Accessibility Patterns
**Learning:** For modal-like components, consistent accessibility requires both ARIA attributes (role='dialog', aria-modal='true', aria-labelledby) and keyboard listeners (Escape key). In this app, using @HostListener for 'Escape' ensures a consistent 'escape hatch' for keyboard users regardless of whether the component uses modern (@if) or legacy (*ngIf) control flow.
**Action:** Always implement @HostListener('window:keydown.escape') in modal-like components and ensure ID-based ARIA labeling matches the header/body elements.
