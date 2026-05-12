## 2025-05-12 - Keyboard-Accessible Brand Identity
**Learning:** Navigation elements like logos are often overlooked for keyboard users when implemented as simple `div` or `img` tags with click handlers. Using a semantic `<button>` with explicit focus rings ensures the primary "Return to Home" action is discoverable and usable via keyboard navigation.
**Action:** Always implement clickable branding elements as semantic `<button>` or `<a>` tags with descriptive `aria-label` and `focus-visible` styles.
