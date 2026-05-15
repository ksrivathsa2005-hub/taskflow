## 2026-05-15 - [ConfirmDialog Accessibility Enhancement]
**Learning:** Generic confirmation dialogs often lack the necessary ARIA attributes (role="alertdialog", aria-modal="true") and keyboard listeners (Escape key) to be fully accessible and intuitive for screen reader and keyboard users.
**Action:** Always ensure modal components include standard ARIA roles, descriptive labels (aria-labelledby/describedby), and global keyboard listeners for expected interactions like closing on Escape.
