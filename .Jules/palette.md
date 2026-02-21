## 2025-02-21 - [Aria labels for user profile buttons]
**Learning:** When adding ARIA labels to buttons that contain dynamic text (like a user's name), ensure the label doesn't obscure the internal information. Using a descriptive label like "Profile for [Name]" is better than a generic "User Profile".
**Action:** Use dynamic attributes like `[attr.aria-label]="'Profile for ' + user.name"` for profile-related interactive elements.

## 2025-02-21 - [Skip to Content Z-Index]
**Learning:** A "Skip to Content" link must have a higher z-index than any sticky navigation headers to be visible when focused.
**Action:** Always use `z-[100]` or similar high value for skip links in apps with sticky navbars.
