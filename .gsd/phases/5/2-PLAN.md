---
phase: 5
plan: 2
wave: 2
---

# Plan 5.2: Advanced Admin Controls Frontend

## Objective
Update the `AdminPage.js` to integrate the APIs developed in wave 1. The admin must be able to securely delete test projects, modify device targeting constraints on the fly, force-close stale test sessions, and download a detailed payment statement.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md
- D:\bharatqa-frontend\src\pages\AdminPage.js
- D:\bharatqa-frontend\src\utils\api.js

## Tasks

<task type="auto">
  <name>Frontend Targeting Override & Test Deletion UI</name>
  <files>
    D:\bharatqa-frontend\src\pages\AdminPage.js
    D:\bharatqa-frontend\src\utils\api.js
  </files>
  <action>
    - Ensure `api.js` has methods for `deleteTestByAdmin(testId)` and `updateTestTargeting(testId, criteriaObject)`.
    - In `AdminPage.js` inside the extended view for a test project, add an "Edit Targeting" button. Clicking this should open a small inline form or modal to adjust `network_type`, `device_tier`, `min_ram_gb`, `max_ram_gb`.
    - Add a "Delete Test" button to the test row action buttons (perhaps replacing the company delete or visually separating it).
    - **CRITICAL:** Implement a strong warning modal when clicking Delete Test. It must prompt the user to type "DELETE" before it proceeds with the deletion.
  </action>
  <verify>grep -n 'deleteTestByAdmin' D:\bharatqa-frontend\src\utils\api.js</verify>
  <done>Admin can delete specific tests safely and override targeting in the extended view.</done>
</task>

<task type="auto">
  <name>Frontend Session Management UI</name>
  <files>
    D:\bharatqa-frontend\src\pages\AdminPage.js
    D:\bharatqa-frontend\src\utils\api.js
  </files>
  <action>
    - Add `forceCloseSession(testId, sessionId)` to `api.js`.
    - In `AdminPage.js` in the extended view for a test, we need a list of active sessions to display, OR a simplified "Force Close Old Sessions" button that releases any session over X hours old. Or display the active sessions in a little table in the expanded test view, where each row has a 'Boot Tester' action.
  </action>
  <verify>grep -n 'forceCloseSession' D:\bharatqa-frontend\src\utils\api.js</verify>
  <done>Admin can see and manually terminate abandoned test sessions.</done>
</task>

<task type="auto">
  <name>Detailed CSV Generation & Export</name>
  <files>
    D:\bharatqa-frontend\src\pages\AdminPage.js
    D:\bharatqa-frontend\src\utils\api.js
  </files>
  <action>
    - Add `exportPaymentHistory()` to `api.js` returning JSON array of history logs.
    - Add an "Export Statement (CSV)" button at the top of the 'payments' tab in `AdminPage.js`.
    - When clicked, fetch the JSON data, convert to CSV string (combining Tester Name, Amount, Date Paid, Task Name, Company Name).
    - Trigger a browser download using `Blob` for a file named `bharatqa_payouts_XYZ.csv`.
  </action>
  <verify>grep -n 'exportPaymentHistory' D:\bharatqa-frontend\src\utils\api.js</verify>
  <done>A button in the Payments tab downloads a correctly formatted CSV containing task/company context.</done>
</task>

## Success Criteria
- [ ] Users cannot accidentally delete tests without typing DELETE.
- [ ] The criteria updates save correctly to the DB and update UI immediately.
- [ ] Orphaned sessions display in extended view and can be forcefully closed.
- [ ] CSV file cleanly imports into Excel/Sheets displaying full payout context.
