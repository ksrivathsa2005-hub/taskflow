## 2026-06-26 - [Form Label Association]
**Learning:** In Angular components with inline templates, form labels often lack programmatic association with their inputs. Explicitly adding `id` attributes to inputs and `for` attributes to labels is essential for screen reader accessibility and improves the interactive target area.
**Action:** Always check inline templates for `id`/`for` pairs on form elements and ensure they are present and unique.
