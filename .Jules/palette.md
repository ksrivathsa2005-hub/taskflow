## 2026-04-07 - [Standardizing Modal Accessibility]
**Learning:** Common modals in this app (Review, Dispute, Confirm) often lack standard ARIA attributes (role="dialog", aria-modal="true") and descriptive labeling (aria-labelledby, aria-describedby), making them difficult for screen reader users to navigate.
**Action:** Always ensure modals include these four attributes and link them to a clear title/description ID.
