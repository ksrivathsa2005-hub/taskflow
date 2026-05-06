## 2026-05-06 - Accessible Custom File Uploads
**Learning:** Custom 'dropzone' areas for file uploads are often inaccessible to keyboard users. Making them accessible requires adding `role="button"`, `tabindex="0"`, and explicit `Enter`/`Space` keydown listeners that proxy to the hidden file input. Additionally, using `pointer-events-none` on nested icons and text ensures the dropzone remains the consistent click and focus target.
**Action:** Always implement `role="button"`, `tabindex="0"`, and keyboard proxies when creating custom interactive containers that wrap hidden inputs.
