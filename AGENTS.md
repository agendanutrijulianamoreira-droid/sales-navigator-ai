# Architecture rules
- Keep calendar ideas in `calendar_items` and personal scratch notes in `quick_notes`; both belong to the signed-in user so planning survives sessions without mixing published media and drafts.
- Generate month plans as sequential seven-day requests to `generate-month-plan`; short batches avoid gateway output truncation and persist completed weeks when a later request fails.
- Reuse the existing Research Hub, Brand Kit, and Photo Studio for source articles and visual preferences rather than maintaining duplicate settings.
