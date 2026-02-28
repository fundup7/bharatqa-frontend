---
phase: 6
plan: 2
wave: 2
---

# Plan 6.2: Frontend - Share Link Expiration Options

## Objective
Update the `AdminPage.js` (or whichever component handles sharing, e.g., `SharedTestDetailPage.js` or `CompanyDashboard.js`) to provide duration options (1 Hour, 1 Day, 7 Days) for result sharing links.

## Context
- `.gsd/SPEC.md`
- `D:\bharatqa-frontend\src\utils\api.js`
- `D:\bharatqa-frontend\src\pages\TestDetailPage.js`

## Tasks

<task type="auto">
  <name>Update api.js</name>
  <files>D:\bharatqa-frontend\src\utils\api.js</files>
  <action>
    - Ensure `generateShareToken(testId, durationHours)` passes `durationHours` via JSON payload instead of an empty POST body.
  </action>
  <verify>Syntax check the file.</verify>
  <done>The API utility supports dynamic expiration.</done>
</task>

<task type="auto">
  <name>Update Share Results UI</name>
  <files>D:\bharatqa-frontend\src\pages\TestDetailPage.js</files>
  <action>
    - Replace the "Share Results" direct button click with a mechanism that asks the user for the duration.
    - Example: Instead of instantly calling the backend, open a mini-modal or dropdown showing "1 Hour", "1 Day", and "7 Days".
    - Pass `1`, `24`, or `168` to the `handleShare` function respectively.
  </action>
  <verify>Verify standard React functional behavior with npm run build (or equivalent check).</verify>
  <done>User can generate a share link explicitly with predefined time bounds.</done>
</task>

## Success Criteria
- [ ] UI prompts for 1h/1d/7d expirations instead of auto-generating.
