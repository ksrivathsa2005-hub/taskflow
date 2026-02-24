## 2026-02-24 - Review Modal over Native Prompts
**Learning:** Native browser prompts like `window.prompt()` are inconsistent with the application's glassmorphism design language and provide a poor user experience. The application provides a dedicated `ReviewModalComponent` for this purpose.
**Action:** Always use `ReviewModalComponent` for gathering reviews and feedback instead of native browser prompts.
