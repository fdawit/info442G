## Quality

### Accessibility
- Every form field has a visible label, and questionnaire answers are grouped with
  fieldset and legend, so screen readers read the question before each answer.
- Error messages (invalid ZIP code, location errors, failed loads, expired answers)
  use role="alert", so screen readers announce them as soon as they appear.
- Map pins are keyboard reachable, have descriptive labels ("Result 1: <name>"), and
  can be selected with the Enter key. The map region has its own label.
- Toggle buttons tell screen readers their state: aria-expanded on Filters,
  aria-pressed on the List/Map buttons, and NavLink marks the current page.
- Images have alt text; placeholder images use empty alt text because they are decorative.
- Every interactive element has a clearly visible focus outline (a :focus-visible rule
  with an offset, so it shows on dark buttons too).
- An axe accessibility audit (WCAG 2 A and AA) found no violations on any page,
  including color contrast.

### Responsivity
- Layouts use flexbox wrapping and CSS grid (auto-fill), so they adapt from 320px phones
  to 1920px desktops; content is capped at a readable width on large screens.
- Tested at 320px wide: no page scrolls sideways, and text is at least 14px.
- The map, filters, sorting and questionnaire work by touch. Controls are native
  inputs, selects and buttons, so phones show their own pickers.
- ZIP code boxes use inputMode="numeric" to bring up the number keypad on phones.

### Security and privacy
- No accounts or passwords, and no personal information is sent to a server.
- Questionnaire answers stay in the user's browser: in memory while answering, then in a
  cookie that expires after 60 minutes (SameSite=Lax). The last searched ZIP code is
  kept in session storage only until the tab is closed.
- ZIP codes are checked (exactly 5 digits) before any search runs.
- External links open in a new tab with rel="noreferrer".
- The app never inserts raw HTML; React escapes all text from the city data and Supabase.
- Only browser-safe keys are used in the front end (the Supabase publishable key).